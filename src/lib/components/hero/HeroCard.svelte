<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { MediaQuery } from 'svelte/reactivity';
	import type { HeroSlide } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	/**
	 * Home hero: a physical CR80 card with a holographic overlay laminate.
	 *
	 * - On load the card rises from lying flat and turns to face the viewer.
	 * - It tilts toward the pointer, and when left alone it floats in a slow loop.
	 * - Light glare and the holo foil move with the tilt; the card has a real
	 *   edge, a floor shadow, and spills light in its own colours.
	 * - Changing slide flips the card over to reveal the next design on its back.
	 *
	 * All per-frame work is written straight to CSS custom properties from one
	 * rAF loop, which only runs while the hero is on screen. Reduced motion gets
	 * a still, slightly angled card and instant slide changes.
	 */

	interface Props {
		slides: HeroSlide[];
	}

	let { slides }: Props = $props();

	const SLIDE_MS = 7000;
	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let current = $state(0);
	let paused = $state(false);
	let hovering = $state(false);
	/** Whole half-turns the card has made; even = front face showing. */
	let turns = $state(0);
	let frontIndex = $state(0);
	let backIndex = $state(0);
	/** Set by the physics attachment; applies a flip instantly under reduced motion. */
	let applyFlip: (() => void) | undefined;

	const slide = $derived(slides[current]);
	const multiple = $derived(slides.length > 1);
	const autoplay = $derived(multiple && !paused && !reducedMotion.current);

	function go(i: number) {
		const next = (i + slides.length) % slides.length;
		if (next === current) return;
		const forward = i > current || (current === slides.length - 1 && next === 0);
		// Put the incoming design on whichever face is currently hidden, then turn
		if (turns % 2 === 0) backIndex = next;
		else frontIndex = next;
		turns += forward ? 1 : -1;
		current = next;
		applyFlip?.();
	}

	/** Physics for tilt, float, entrance and flip. */
	const physics: Attachment<HTMLElement> = (scene) => {
		const card = scene.querySelector<HTMLElement>('[data-card]')!;
		const reduced = reducedMotion.current;

		const pointer = { x: 0, y: 0, active: false };
		const tilt = { x: 0, y: 0 };
		const flip = { x: 0, v: 0 };
		let entrance = reduced ? 1 : 0;
		let t = 0;
		let last = performance.now();
		let raf = 0;
		let visible = true;

		const write = () => {
			// Rest pose is turned slightly away, so the edge and foil read as 3D
			const lift = 1 - entrance;
			const ease = 1 - Math.pow(lift, 3);
			const rx = 8 + tilt.x + lift * 62;
			const ry = -14 + tilt.y;
			const flipDeg = flip.x;
			card.style.transform = `translate3d(0, ${(lift * 18).toFixed(2)}%, ${(-lift * 180).toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${(ry + flipDeg).toFixed(2)}deg)`;
			card.style.opacity = String(Math.min(1, ease * 1.6));
			// Light and foil follow the angle the card makes with the viewer
			const gx = 50 + tilt.y * 2.6;
			const gy = 40 - tilt.x * 2.6;
			scene.style.setProperty('--gx', `${gx.toFixed(1)}%`);
			scene.style.setProperty('--gy', `${gy.toFixed(1)}%`);
			scene.style.setProperty('--foil', `${(50 + tilt.y * 3 + tilt.x * 2).toFixed(1)}%`);
			scene.style.setProperty(
				'--sheen',
				(0.25 + Math.min(1, Math.hypot(tilt.x, tilt.y) / 14) * 0.5).toFixed(3)
			);
			scene.style.setProperty('--shadow-x', `${(-tilt.y * 1.4).toFixed(1)}px`);
			scene.style.setProperty('--shadow-s', (0.75 + ease * 0.25).toFixed(3));
		};

		const frame = (now: number) => {
			const dt = Math.min((now - last) / 1000, 1 / 20);
			last = now;
			t += dt;

			if (entrance < 1) entrance = Math.min(1, entrance + dt / 1.5);

			// Idle float: a slow Lissajous so the card never sits dead still
			const idleX = Math.sin(t * 0.7) * 3.5;
			const idleY = Math.sin(t * 0.47 + 1) * 7;
			const target = pointer.active
				? { x: -pointer.y * 14, y: pointer.x * 20 }
				: { x: idleX, y: idleY };
			const k = 1 - Math.pow(0.0015, dt); // frame-rate independent ease
			tilt.x += (target.x - tilt.x) * k;
			tilt.y += (target.y - tilt.y) * k;

			// Flip: an underdamped spring, so the card lands with a small settle
			const goal = turns * 180;
			const a = (goal - flip.x) * 90 - flip.v * 13;
			flip.v += a * dt;
			flip.x += flip.v * dt;

			write();
			raf = requestAnimationFrame(frame);
		};

		const start = () => {
			if (raf || reduced || !visible || document.hidden) return;
			last = performance.now();
			raf = requestAnimationFrame(frame);
		};
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};

		const hero = scene.closest('section') ?? scene;
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			const r = scene.getBoundingClientRect();
			pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
			pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
			pointer.active = true;
		};
		const onLeave = () => (pointer.active = false);
		hero.addEventListener('pointermove', onMove as EventListener);
		hero.addEventListener('pointerleave', onLeave);

		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			visible ? start() : stop();
		});
		io.observe(scene);
		const onVisibility = () => (document.hidden ? stop() : start());
		document.addEventListener('visibilitychange', onVisibility);

		// Reduced motion: no loop; flips apply instantly
		applyFlip = () => {
			if (!reduced) return;
			flip.x = turns * 180;
			write();
		};
		write();
		start();

		return () => {
			stop();
			applyFlip = undefined;
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			hero.removeEventListener('pointermove', onMove as EventListener);
			hero.removeEventListener('pointerleave', onLeave);
		};
	};
</script>

{#snippet face(s: HeroSlide | undefined, priority: boolean)}
	<div class="face-art">
		{#if s?.image}
			<SanityImage
				image={s.image}
				width={680}
				aspect={1.586}
				sizes="(min-width: 1024px) 38vw, 86vw"
				{priority}
				alt=""
				class="h-full w-full object-cover"
			/>
		{/if}
	</div>
	<span class="foil" aria-hidden="true"></span>
	<span class="glare" aria-hidden="true"></span>
{/snippet}

{#if slide}
	<section
		class="px-2 pt-2 sm:px-3 sm:pt-3"
		aria-roledescription="carousel"
		aria-label="Highlights"
		onpointerenter={() => (hovering = true)}
		onpointerleave={() => (hovering = false)}
		onfocusin={() => (hovering = true)}
		onfocusout={() => (hovering = false)}
	>
		<div class="panel">
			<div
				class="shell relative grid items-center gap-2 pt-4 pb-10 md:pt-10 lg:min-h-[min(46rem,calc(100dvh-var(--header-h)-1.5rem))] lg:grid-cols-12 lg:gap-4 lg:py-16"
			>
				<!-- Copy -->
				<div class="relative z-10 lg:col-span-6" aria-live={autoplay ? 'off' : 'polite'}>
					{#key current}
						<div
							class="copy"
							role="group"
							aria-roledescription="slide"
							aria-label="{current + 1} of {slides.length}"
						>
							<h1 class="headline">{slide.heading}</h1>
							{#if slide.subtitle}
								<p class="mt-5 max-w-[34rem] leading-relaxed text-white/72 md:mt-6 md:text-lg">
									{slide.subtitle}
								</p>
							{/if}
							{#if slide.primaryCta || slide.secondaryCta}
								<div class="mt-8 flex flex-wrap gap-3 md:mt-9">
									{#if slide.primaryCta}
										<Button href={slide.primaryCta.href} size="lg" variant="accent"
											>{slide.primaryCta.label}</Button
										>
									{/if}
									{#if slide.secondaryCta}
										<Button href={slide.secondaryCta.href} size="lg" variant="outline-inverse"
											>{slide.secondaryCta.label}</Button
										>
									{/if}
								</div>
							{/if}
						</div>
					{/key}

					{#if multiple}
						<div class="mt-10 flex max-w-[34rem] items-center gap-4 md:mt-12">
							<div class="flex items-center gap-1.5">
								<button class="ctrl" aria-label="Previous slide" onclick={() => go(current - 1)}>
									<Icon name="chevron-left" size={18} />
								</button>
								<button class="ctrl" aria-label="Next slide" onclick={() => go(current + 1)}>
									<Icon name="chevron-right" size={18} />
								</button>
								{#if !reducedMotion.current}
									<button
										class="ctrl"
										aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
										onclick={() => (paused = !paused)}
									>
										<Icon name={paused ? 'play' : 'pause'} size={16} />
									</button>
								{/if}
							</div>
							<ol class="flex flex-1 gap-2" aria-label="Choose slide">
								{#each slides as s, i (s._key)}
									<li class="flex-1">
										<button
											class="pip"
											aria-label="Slide {i + 1}: {s.heading}"
											aria-current={i === current ? 'true' : undefined}
											onclick={() => go(i)}
										>
											<span
												class={[
													'fill',
													(i < current || (i === current && !autoplay)) && 'done',
													i === current && autoplay && 'run'
												]}
												style:--dur="{SLIDE_MS}ms"
												style:--state={hovering ? 'paused' : 'running'}
												onanimationend={() => i === current && go(current + 1)}
											></span>
										</button>
									</li>
								{/each}
							</ol>
						</div>
					{/if}
				</div>

				<!-- The card -->
				<div class="order-first lg:order-none lg:col-span-6" aria-hidden="true">
					<div class="scene" {@attach physics}>
						<!-- Light the card's own colours spill onto the surface below -->
						<div class="spill">
							{#key current}
								<div class="spill-art">
									{#if slide.image}
										<SanityImage
											image={slide.image}
											width={200}
											aspect={1.586}
											sizes="200px"
											alt=""
											class="h-full w-full object-cover"
										/>
									{/if}
								</div>
							{/key}
						</div>
						<div class="floor"></div>

						<div class="card" data-card>
							<!-- 0.76 mm of PVC: stacked layers give the card a visible edge -->
							{#each [1, 2, 3, 4] as z (z)}
								<span class="edge" style:--z={z}></span>
							{/each}
							<div class="side front">
								{@render face(slides[frontIndex], true)}
							</div>
							<div class="side back">
								{@render face(slides[backIndex], false)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.panel {
		position: relative;
		overflow: hidden;
		border-radius: clamp(18px, 2.4vw, 32px);
		background:
			radial-gradient(60% 70% at 78% 55%, #1c3a5a 0%, transparent 70%),
			linear-gradient(160deg, #0f2233 0%, #0a1726 100%);
		color: white;
		isolation: isolate;
	}
	/* Fine grain, so the dark reads as a surface rather than a flat fill */
	.panel::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		opacity: 0.22;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
		mix-blend-mode: soft-light;
		pointer-events: none;
	}

	.headline {
		max-width: 13ch;
		font-size: clamp(2.6rem, 1.4rem + 5vw, 5.75rem);
		font-weight: 700;
		font-variation-settings: 'wdth' 125;
		letter-spacing: -0.035em;
		line-height: 0.95;
		color: white;
		text-wrap: balance;
	}

	.copy {
		animation: copy-in 800ms var(--ease-out) both;
	}
	@keyframes copy-in {
		from {
			opacity: 0;
			transform: translateY(14px);
			filter: blur(6px);
		}
	}

	.ctrl {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 1px solid rgb(255 255 255 / 0.22);
		border-radius: 50%;
		color: white;
		transition:
			background-color var(--dur-2) var(--ease-out),
			border-color var(--dur-2) var(--ease-out),
			transform var(--dur-1) var(--ease-out);
	}
	.ctrl:hover {
		background: rgb(255 255 255 / 0.1);
		border-color: rgb(255 255 255 / 0.5);
	}
	.ctrl:active {
		transform: scale(0.94);
	}
	.ctrl:focus-visible,
	.pip:focus-visible {
		outline-color: var(--color-process-yellow);
	}

	.pip {
		display: block;
		width: 100%;
		padding-block: 0.75rem;
		cursor: pointer;
	}
	.fill {
		position: relative;
		display: block;
		height: 3px;
		border-radius: 2px;
		background: rgb(255 255 255 / 0.18);
		overflow: hidden;
	}
	.fill::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--color-process-yellow);
		transform: scaleX(0);
		transform-origin: left;
	}
	.fill.done::after {
		transform: scaleX(1);
		background: white;
	}
	.fill.run::after {
		animation: pip-fill var(--dur) linear forwards;
		animation-play-state: var(--state);
	}
	@keyframes pip-fill {
		to {
			transform: scaleX(1);
		}
	}

	/* ---- Scene ---------------------------------------------------------- */
	.scene {
		--gx: 50%;
		--gy: 40%;
		--foil: 50%;
		--sheen: 0.35;
		--shadow-x: 0px;
		--shadow-s: 1;
		position: relative;
		width: min(100%, 36rem);
		margin-inline: auto;
		padding: 8% 7% 15%;
		perspective: 1100px;
		perspective-origin: 50% 40%;
	}
	.card {
		position: relative;
		aspect-ratio: 1.586;
		transform-style: preserve-3d;
		transform: rotateX(8deg) rotateY(-14deg);
		will-change: transform;
	}
	.side,
	.edge {
		position: absolute;
		inset: 0;
		/* CR80 corners: 3.18 mm on an 85.6 × 54 mm card */
		border-radius: 3.7% / 5.9%;
	}
	.side {
		overflow: hidden;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		background: #f7f8fa;
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.35);
	}
	/* Faces sit either side of the edge layers, so each face covers them */
	.front {
		transform: translateZ(2.5px);
	}
	.back {
		transform: rotateY(180deg) translateZ(2.5px);
	}
	.edge {
		background: linear-gradient(90deg, #cfd6de, #eef2f6 40%, #bfc8d2);
		transform: translateZ(calc((var(--z) - 2.5) * 1px));
	}
	.face-art {
		position: absolute;
		inset: 0;
	}

	/* Holographic overlay laminate: diffraction colours through a security
	   pattern, strongest where the light catches the tilted card */
	.foil {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				115deg,
				transparent 12%,
				#00d4ff 24%,
				#8b5cf6 33%,
				#ff3fa4 42%,
				#ffd100 51%,
				#3ee6c1 60%,
				#00d4ff 69%,
				transparent 84%
			),
			conic-gradient(
				from 0deg at var(--gx) var(--gy),
				#00d4ff,
				#ff3fa4,
				#ffd100,
				#3ee6c1,
				#8b5cf6,
				#00d4ff
			);
		background-size:
			240% 240%,
			100% 100%;
		background-position:
			var(--foil) var(--foil),
			center;
		background-blend-mode: screen;
		mix-blend-mode: color-dodge;
		opacity: calc(0.2 + var(--sheen) * 0.9);
		-webkit-mask-image:
			repeating-radial-gradient(circle at 30% 45%, #000 0 1.4px, transparent 1.4px 6px),
			repeating-linear-gradient(60deg, #000 0 1px, transparent 1px 4px),
			radial-gradient(circle at var(--gx) var(--gy), #000 0%, transparent 65%);
		mask-image:
			repeating-radial-gradient(circle at 30% 45%, #000 0 1.4px, transparent 1.4px 6px),
			repeating-linear-gradient(60deg, #000 0 1px, transparent 1px 4px),
			radial-gradient(circle at var(--gx) var(--gy), #000 0%, transparent 65%);
		-webkit-mask-composite: source-over;
		mask-composite: add;
		pointer-events: none;
	}
	/* Specular glare from a light above-left of the viewer */
	.glare {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle at var(--gx) var(--gy),
			rgb(255 255 255 / 0.7) 0%,
			rgb(255 255 255 / 0.18) 22%,
			transparent 55%
		);
		mix-blend-mode: soft-light;
		opacity: calc(0.45 + var(--sheen));
		pointer-events: none;
	}

	.floor {
		position: absolute;
		left: 14%;
		right: 14%;
		bottom: 6%;
		height: 12%;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(0 0 0 / 0.55), transparent);
		filter: blur(10px);
		transform: translateX(var(--shadow-x)) scaleX(var(--shadow-s));
	}
	.spill {
		position: absolute;
		inset: 12% 4% 2%;
		filter: blur(46px) saturate(1.8);
		opacity: 0.55;
		transform: translateY(14%) scaleY(0.7);
		pointer-events: none;
	}
	.spill-art {
		width: 100%;
		height: 100%;
		animation: spill-in 900ms var(--ease-out) both;
	}
	@keyframes spill-in {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.copy,
		.spill-art {
			animation: none;
		}
	}
</style>
