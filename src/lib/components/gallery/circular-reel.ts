/**
 * WebGL engine behind <CircularGallery>: a looping, bent reel of card-shaped
 * photos with captions. Adapted from React Bits' CircularGallery (ogl):
 *
 * - Input is scoped to the reel. Vertical wheel still scrolls the page; only
 *   horizontal wheel/trackpad, drags and the component's buttons move it.
 * - Idle drift: when nobody is interacting, the reel slides slowly on its own
 *   and pauses on hover, drag, the pause button, offscreen
 *   and in background tabs.
 * - Frames use the CR80 card ratio and images wipe in like a print pass,
 *   matching the rest of the site.
 * - Frame-rate independent easing, resize via ResizeObserver, full GPU cleanup.
 */
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import type { OGLRenderingContext } from 'ogl';

export interface ReelItem {
	image: string;
	text: string;
}

export interface ReelOptions {
	items: ReelItem[];
	/** Curvature; positive bends the ends down, negative up, 0 is flat. */
	bend?: number;
	/** Card width ÷ height. Defaults to the CR80 ID card. */
	aspect?: number;
	/** Corner radius as a fraction of card height. */
	borderRadius?: number;
	textColor?: string;
	fontFamily?: string;
	fontWeight?: number;
	/** Background shown while an image loads, and wiped over by it. */
	placeholderColor?: string;
	/** Drag / wheel multiplier; 1 makes a drag track the pointer exactly. */
	scrollSpeed?: number;
	/** Easing per 60 fps frame, 0–1. Lower is smoother. */
	scrollEase?: number;
	/** Idle drift in cards per minute; 0 disables it. */
	drift?: number;
	/** Quiet time after an interaction before the drift resumes, in ms. */
	resumeAfter?: number;
	paused?: boolean;
	reducedMotion?: boolean;
	onchange?: (index: number) => void;
	onactivate?: (index: number) => void;
}

const CARD_HEIGHT = 0.6; // of viewport height
const MAX_CARD_WIDTH = 0.74; // of viewport width
const GAP = 0.1; // of card width
const LABEL_HEIGHT = 0.085; // of card height
const LABEL_GAP = 0.07; // of card height
const LABEL_PX = 64; // label texture font size
const TEX_WIDTH = 1280;

const VERTEX = /* glsl */ `
	attribute vec3 position;
	attribute vec2 uv;
	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	uniform float uTime;
	uniform float uWave;
	varying vec2 vUv;
	void main() {
		vUv = uv;
		vec3 p = position;
		p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * uWave;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
	}
`;

const FRAGMENT = /* glsl */ `
	precision highp float;
	uniform sampler2D tMap;
	uniform vec2 uSize;
	uniform float uRadius;
	uniform float uPixel;
	uniform float uReveal;
	uniform vec3 uPlaceholder;
	varying vec2 vUv;

	float roundedBox(vec2 p, vec2 b, float r) {
		vec2 d = abs(p) - b + r;
		return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
	}

	void main() {
		// Rounded corners measured in world units, so they stay circular
		float d = roundedBox((vUv - 0.5) * uSize, uSize * 0.5, uRadius);
		float alpha = 1.0 - smoothstep(-uPixel, uPixel, d);
		// Print-pass wipe: the image is laid down left to right
		float laid = 1.0 - smoothstep(uReveal * 1.15 - 0.15, uReveal * 1.15, vUv.x);
		vec3 color = mix(uPlaceholder, texture2D(tMap, vUv).rgb, laid);
		gl_FragColor = vec4(color, alpha);
	}
`;

const LABEL_FRAGMENT = /* glsl */ `
	precision highp float;
	uniform sampler2D tMap;
	varying vec2 vUv;
	void main() {
		gl_FragColor = texture2D(tMap, vUv);
	}
`;

const LABEL_VERTEX = /* glsl */ `
	attribute vec3 position;
	attribute vec2 uv;
	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

function hexToRgb(color: string): [number, number, number] {
	const ctx = document.createElement('canvas').getContext('2d')!;
	ctx.fillStyle = color;
	const hex = ctx.fillStyle.startsWith('#') ? ctx.fillStyle : '#e8ecef';
	const n = parseInt(hex.slice(1, 7), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Draws the image into a card-shaped canvas, cropped to cover. */
function coverCanvas(img: HTMLImageElement, aspect: number, background: string) {
	const canvas = document.createElement('canvas');
	canvas.width = TEX_WIDTH;
	canvas.height = Math.round(TEX_WIDTH / aspect);
	const iw = img.naturalWidth || canvas.width;
	const ih = img.naturalHeight || canvas.height;
	const scale = Math.max(canvas.width / iw, canvas.height / ih);
	const w = iw * scale;
	const h = ih * scale;
	const ctx = canvas.getContext('2d')!;
	// Transparent artwork sits on the placeholder colour, not on black
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
	return canvas;
}

/** Caption texture; long captions are ellipsised to the card's width. */
function labelCanvas(text: string, font: string, color: string, maxRatio: number) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;
	const height = Math.ceil(LABEL_PX * 1.35);
	const maxWidth = Math.floor(height * maxRatio);
	ctx.font = font;
	let label = text;
	if (ctx.measureText(label).width > maxWidth) {
		while (label.length > 1 && ctx.measureText(`${label}…`).width > maxWidth)
			label = label.slice(0, -1);
		label = `${label.trimEnd()}…`;
	}
	canvas.width = Math.ceil(ctx.measureText(label).width) + 8;
	canvas.height = height;
	ctx.font = font;
	ctx.fillStyle = color;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(label, canvas.width / 2, canvas.height / 2);
	return canvas;
}

let warned = false;

class Card {
	group = new Transform();
	plane: Mesh;
	label: Mesh;
	program: Program;
	labelRatio: number;
	x = 0;
	reveal = 0;
	loaded = false;
	private img = new Image();

	constructor(
		gl: OGLRenderingContext,
		geometry: Plane,
		scene: Transform,
		readonly index: number,
		item: ReelItem,
		opts: Required<Pick<ReelOptions, 'aspect' | 'textColor' | 'placeholderColor'>> & {
			font: string;
		}
	) {
		const texture = new Texture(gl, { generateMipmaps: true });
		this.program = new Program(gl, {
			vertex: VERTEX,
			fragment: FRAGMENT,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			uniforms: {
				tMap: { value: texture },
				uSize: { value: [1, 1] },
				uRadius: { value: 0 },
				uPixel: { value: 0.01 },
				uReveal: { value: 0 },
				uPlaceholder: { value: hexToRgb(opts.placeholderColor) },
				uTime: { value: Math.random() * 100 },
				uWave: { value: 0 }
			}
		});
		this.plane = new Mesh(gl, { geometry, program: this.program });
		this.plane.setParent(this.group);

		const maxRatio = (opts.aspect * 0.96) / LABEL_HEIGHT;
		const text = labelCanvas(item.text, opts.font, opts.textColor, maxRatio);
		this.labelRatio = text.width / text.height;
		const labelTexture = new Texture(gl, { generateMipmaps: false });
		labelTexture.image = text;
		this.label = new Mesh(gl, {
			geometry,
			program: new Program(gl, {
				vertex: LABEL_VERTEX,
				fragment: LABEL_FRAGMENT,
				transparent: true,
				depthTest: false,
				depthWrite: false,
				uniforms: { tMap: { value: labelTexture } }
			})
		});
		this.label.setParent(this.group);
		this.group.setParent(scene);

		this.img.crossOrigin = 'anonymous';
		this.img.decoding = 'async';
		this.img.onload = () => {
			texture.image = coverCanvas(this.img, opts.aspect, opts.placeholderColor);
			this.loaded = true;
		};
		// WebGL can only use images served with CORS headers. For Sanity that
		// means the site's origin must be listed under API → CORS origins.
		this.img.onerror = () => {
			if (warned) return;
			warned = true;
			console.warn(
				`CircularGallery: could not load ${item.image} as a WebGL texture. ` +
					`If it is a Sanity image, add ${location.origin} under API → CORS origins at sanity.io/manage.`
			);
		};
		this.img.src = item.image;
	}

	layout(width: number, height: number, radius: number, pixel: number, x: number) {
		this.plane.scale.set(width, height, 1);
		this.program.uniforms.uSize.value = [width, height];
		this.program.uniforms.uRadius.value = radius;
		this.program.uniforms.uPixel.value = pixel;
		const lh = height * LABEL_HEIGHT;
		this.label.scale.set(lh * this.labelRatio, lh, 1);
		this.label.position.y = -height / 2 - height * LABEL_GAP - lh / 2;
		this.x = x;
	}

	cancel() {
		this.img.onload = this.img.onerror = null;
		this.img.src = '';
	}
}

export class Reel {
	private renderer: Renderer;
	private gl: OGLRenderingContext;
	private camera: Camera;
	private scene = new Transform();
	private geometry: Plane;
	private cards: Card[] = [];
	private count: number;

	private o: Required<Omit<ReelOptions, 'onchange' | 'onactivate' | 'items'>>;
	private onchange?: (index: number) => void;
	private onactivate?: (index: number) => void;

	private scroll = { current: 0, target: 0, last: 0 };
	private screen = { width: 1, height: 1 };
	private viewport = { width: 1, height: 1 };
	private cardW = 1;
	private cardH = 1;
	private stride = 1;
	private span = 1;
	/** Radius of the arc the cards ride on; 0 when flat. */
	private radius = 0;

	private raf = 0;
	private then = 0;
	private visible = false;
	private hovering = false;
	private drag: {
		id: number;
		x: number;
		from: number;
		moved: number;
		t: number;
		v: number;
	} | null = null;
	private lastInput = -Infinity;
	private wheelTimer = 0;
	private active = -1;

	private ro: ResizeObserver;
	private io: IntersectionObserver;
	private listeners: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [];

	constructor(
		private container: HTMLElement,
		{ items, onchange, onactivate, ...options }: ReelOptions
	) {
		this.o = {
			bend: 3,
			aspect: 1.586,
			borderRadius: 0.06,
			textColor: '#0f2233',
			fontFamily: 'sans-serif',
			fontWeight: 600,
			placeholderColor: '#e8ecef',
			scrollSpeed: 1,
			scrollEase: 0.075,
			drift: 5,
			resumeAfter: 2200,
			paused: false,
			reducedMotion: false,
			...options
		};
		this.onchange = onchange;
		this.onactivate = onactivate;

		this.renderer = new Renderer({
			alpha: true,
			antialias: true,
			dpr: Math.min(window.devicePixelRatio || 1, 2)
		});
		this.gl = this.renderer.gl;
		this.gl.clearColor(0, 0, 0, 0);
		const canvas = this.gl.canvas as HTMLCanvasElement;
		canvas.setAttribute('aria-hidden', 'true');
		canvas.style.display = 'block';
		container.appendChild(canvas);

		this.camera = new Camera(this.gl, { fov: 45 });
		this.camera.position.z = 20;
		this.geometry = new Plane(this.gl, { widthSegments: 60, heightSegments: 30 });

		// Enough copies that the loop never shows a gap, even with few photos
		this.count = items.length;
		const copies = Math.max(2, Math.ceil(10 / this.count));
		const font = `${this.o.fontWeight} ${LABEL_PX}px ${this.o.fontFamily}`;
		for (let c = 0; c < copies; c++)
			items.forEach((item, i) => {
				this.cards.push(
					new Card(this.gl, this.geometry, this.scene, c * this.count + i, item, {
						aspect: this.o.aspect,
						textColor: this.o.textColor,
						placeholderColor: this.o.placeholderColor,
						font
					})
				);
			});

		this.resize();
		this.bind();

		this.ro = new ResizeObserver(() => this.resize());
		this.ro.observe(container);
		this.io = new IntersectionObserver(([entry]) => {
			this.visible = entry.isIntersecting;
			this.sync();
		});
		this.io.observe(container);
	}

	// ── Public controls ──────────────────────────────────────────────────

	next() {
		this.step(1);
	}

	prev() {
		this.step(-1);
	}

	setPaused(paused: boolean) {
		this.o.paused = paused;
		if (paused) this.snap();
	}

	destroy() {
		cancelAnimationFrame(this.raf);
		clearTimeout(this.wheelTimer);
		this.ro.disconnect();
		this.io.disconnect();
		for (const [target, type, fn, opts] of this.listeners)
			target.removeEventListener(type, fn, opts);
		this.cards.forEach((c) => c.cancel());
		this.gl.getExtension('WEBGL_lose_context')?.loseContext();
		(this.gl.canvas as HTMLCanvasElement).remove();
	}

	// ── Layout ───────────────────────────────────────────────────────────

	private resize() {
		const { clientWidth: width, clientHeight: height } = this.container;
		if (!width || !height) return;
		const progress = this.scroll.current / this.stride;
		this.screen = { width, height };
		this.renderer.setSize(width, height);
		this.camera.perspective({ aspect: width / height });
		const vh = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
		this.viewport = { width: vh * (width / height), height: vh };

		this.cardH = vh * CARD_HEIGHT;
		this.cardW = this.cardH * this.o.aspect;
		const maxW = this.viewport.width * MAX_CARD_WIDTH;
		if (this.cardW > maxW) {
			this.cardW = maxW;
			this.cardH = maxW / this.o.aspect;
		}
		this.stride = this.cardW * (1 + GAP);
		this.span = this.stride * this.cards.length;
		const pixel = this.viewport.width / width;
		const radius = this.cardH * this.o.borderRadius;
		this.cards.forEach((c) => {
			c.layout(this.cardW, this.cardH, radius, pixel, c.index * this.stride);
		});
		// Curvature scales with the reel, and eases off on narrow screens where
		// the neighbouring cards already sit near the edges.
		const H = this.viewport.width / 2;
		const B =
			Math.abs(this.o.bend) * (this.viewport.width / 42) * Math.min(Math.max(width / 1100, 0.4), 1);
		this.radius = B ? (H * H + B * B) / (2 * B) : 0;

		// Centre what is actually visible: the front card's top edge down to the
		// neighbours' captions, which the bend pulls lower.
		const ex = Math.min(this.stride, H);
		const drop = this.radius ? this.radius - Math.sqrt(this.radius ** 2 - ex * ex) : 0;
		const bottom = this.cardH / 2 + this.cardH * (LABEL_HEIGHT + LABEL_GAP) + drop;
		this.scene.position.y = (bottom - this.cardH / 2) / 2;

		// Keep the same card in front across resizes
		this.scroll.current = this.scroll.last = this.scroll.target = progress * this.stride || 0;
		this.frame(0);
	}

	// ── Loop ─────────────────────────────────────────────────────────────

	/** Runs the rAF loop only while the reel is on screen and the tab is visible. */
	private sync() {
		const run = this.visible && !document.hidden;
		if (run && !this.raf) {
			this.then = performance.now();
			this.raf = requestAnimationFrame(this.tick);
		} else if (!run && this.raf) {
			cancelAnimationFrame(this.raf);
			this.raf = 0;
		}
	}

	private tick = (now: number) => {
		const dt = Math.min((now - this.then) / 1000, 0.1);
		this.then = now;
		this.frame(dt, now);
		this.raf = requestAnimationFrame(this.tick);
	};

	private drifting(now: number) {
		return (
			this.o.drift > 0 &&
			!this.o.paused &&
			!this.hovering &&
			!this.drag &&
			now - this.lastInput > this.o.resumeAfter
		);
	}

	private frame(dt: number, now = performance.now()) {
		const { reducedMotion } = this.o;
		if (this.drifting(now)) this.scroll.target += ((this.o.drift * this.stride) / 60) * dt;

		// Frame-rate independent ease toward the target
		const ease = reducedMotion ? 0.35 : this.o.scrollEase;
		const k = 1 - Math.pow(1 - ease, dt * 60);
		this.scroll.current += (this.scroll.target - this.scroll.current) * (dt ? k : 1);
		if (Math.abs(this.scroll.target - this.scroll.current) < 1e-4)
			this.scroll.current = this.scroll.target;

		const velocity = this.scroll.current - this.scroll.last;
		const wave = reducedMotion ? 0 : 0.02 + Math.min(Math.abs(velocity) / this.stride, 0.4) * 0.6;
		const H = this.viewport.width / 2;
		const R = this.radius;
		let nearest = Infinity;
		let active = 0;

		for (const card of this.cards) {
			const g = card.group;
			// Position on the loop, kept within half a loop either side of centre
			const x0 = card.x - this.scroll.current + this.span / 2;
			g.position.x = x0 - Math.floor(x0 / this.span) * this.span - this.span / 2;

			const x = g.position.x;
			if (R) {
				const ex = Math.min(Math.abs(x), H);
				const arc = R - Math.sqrt(R * R - ex * ex);
				const angle = Math.sign(x) * Math.asin(ex / R);
				g.position.y = this.o.bend > 0 ? -arc : arc;
				g.rotation.z = this.o.bend > 0 ? -angle : angle;
			} else {
				g.position.y = 0;
				g.rotation.z = 0;
			}

			const u = card.program.uniforms;
			if (!reducedMotion) u.uTime.value += dt * 2.4;
			u.uWave.value += (wave - u.uWave.value) * Math.min(dt * 8, 1);
			if (card.loaded && card.reveal < 1) {
				card.reveal = reducedMotion ? 1 : Math.min(card.reveal + dt / 0.9, 1);
				// ease-in-out, like the site's CSS image wipe
				const t = card.reveal;
				u.uReveal.value = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
			}

			if (Math.abs(x) < nearest) {
				nearest = Math.abs(x);
				active = card.index % this.count;
			}
		}

		this.renderer.render({ scene: this.scene, camera: this.camera });
		this.scroll.last = this.scroll.current;

		if (active !== this.active) {
			this.active = active;
			this.onchange?.(active);
		}
	}

	// ── Input ────────────────────────────────────────────────────────────

	private snap() {
		this.scroll.target = Math.round(this.scroll.target / this.stride) * this.stride;
	}

	private step(d: number) {
		this.lastInput = performance.now();
		this.scroll.target = (Math.round(this.scroll.target / this.stride) + d) * this.stride;
	}

	/** Card under a client point, as an item index, or -1. */
	private hit(clientX: number, clientY: number) {
		const rect = this.container.getBoundingClientRect();
		const wx = ((clientX - rect.left) / rect.width - 0.5) * this.viewport.width;
		const wy = (0.5 - (clientY - rect.top) / rect.height) * this.viewport.height;
		for (const card of this.cards) {
			const g = card.group;
			const dx = wx - g.position.x;
			const dy = wy - g.position.y - this.scene.position.y;
			const cos = Math.cos(-g.rotation.z);
			const sin = Math.sin(-g.rotation.z);
			const lx = dx * cos - dy * sin;
			const ly = dx * sin + dy * cos;
			if (Math.abs(lx) < this.cardW / 2 && Math.abs(ly) < this.cardH / 2)
				return card.index % this.count;
		}
		return -1;
	}

	private on<K extends keyof HTMLElementEventMap>(
		target: EventTarget,
		type: K | 'visibilitychange',
		fn: (e: HTMLElementEventMap[K]) => void,
		opts?: AddEventListenerOptions
	) {
		target.addEventListener(type, fn as EventListener, opts);
		this.listeners.push([target, type, fn as EventListener, opts]);
	}

	private bind() {
		const el = this.container;
		const toWorld = () => (this.viewport.width / this.screen.width) * this.o.scrollSpeed;

		this.on(el, 'pointerdown', (e) => {
			if (e.button !== 0) return;
			this.drag = {
				id: e.pointerId,
				x: e.clientX,
				from: this.scroll.target,
				moved: 0,
				t: e.timeStamp,
				v: 0
			};
			el.setPointerCapture(e.pointerId);
		});

		this.on(el, 'pointermove', (e) => {
			const d = this.drag;
			if (!d) {
				if (e.pointerType === 'mouse')
					el.style.cursor = this.hit(e.clientX, e.clientY) >= 0 ? 'pointer' : '';
				return;
			}
			if (e.pointerId !== d.id) return;
			const dx = d.x - e.clientX;
			const target = d.from + dx * toWorld();
			const elapsed = Math.max(e.timeStamp - d.t, 1);
			d.v = ((target - this.scroll.target) / elapsed) * 1000;
			d.t = e.timeStamp;
			d.moved = Math.max(d.moved, Math.abs(dx));
			this.scroll.target = target;
		});

		const release = (e: PointerEvent) => {
			const d = this.drag;
			if (!d || e.pointerId !== d.id) return;
			this.drag = null;
			this.lastInput = performance.now();
			if (e.type === 'pointerup' && d.moved < 6) {
				const index = this.hit(e.clientX, e.clientY);
				if (index >= 0) this.onactivate?.(index);
				return;
			}
			// Flick: carry some velocity, then land on a card
			const v = Math.max(-this.stride * 6, Math.min(this.stride * 6, d.v));
			this.scroll.target += v * 0.18;
			this.snap();
		};
		this.on(el, 'pointerup', release);
		this.on(el, 'pointercancel', release);

		this.on(el, 'pointerenter', (e) => {
			if (e.pointerType === 'mouse') this.hovering = true;
		});
		this.on(el, 'pointerleave', () => {
			this.hovering = false;
			el.style.cursor = '';
		});

		// Horizontal wheel / trackpad swipes (and Shift + wheel) move the reel;
		// plain vertical wheel keeps scrolling the page.
		this.on(
			el,
			'wheel',
			(e) => {
				const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
				if (Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY)) return;
				e.preventDefault();
				const scale = e.deltaMode === 1 ? 16 : 1;
				this.scroll.target += dx * scale * toWorld();
				this.lastInput = performance.now();
				clearTimeout(this.wheelTimer);
				this.wheelTimer = window.setTimeout(() => this.snap(), 160);
			},
			{ passive: false }
		);

		this.on(document, 'visibilitychange', () => this.sync());
	}
}
