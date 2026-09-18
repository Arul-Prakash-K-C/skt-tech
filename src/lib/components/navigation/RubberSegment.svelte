<!--
	RubberSegment — Svelte 5 port of React Bits' <RubberSegment /> (JS + CSS
	variant), styled with Tailwind and animated with motion's vanilla core.

	A tap dilates the thumb across the old and new slot, then the leading edge
	springs in and the trailing edge lands a few px past its slot ("squash")
	before relaxing. The thumb can be grabbed, dragged (rubber-banded at the
	ends) and flicked. Extensions for navigation use:
	  - items with `href` render as real links (works without JS, router-friendly)
	  - `value` matching no item hides the thumb (e.g. pages outside the nav)
	  - `animateExternal` animates value changes from outside (back/forward)
-->
<script lang="ts" module>
	export interface SegmentItem {
		value: string;
		label: string;
		href?: string;
		/** Render the `accessory` snippet inside this slot (e.g. a submenu toggle). */
		accessory?: boolean;
	}

	const EASE_OUT = [0.23, 1, 0.32, 1] as const;
	const SPRING_UI = { type: 'spring', bounce: 0 } as const;
	const SPRING_MOMENTUM = { type: 'spring', bounce: 0.2 } as const;
	const SPRING_RELAX = { type: 'spring', bounce: 0 } as const;
	const DILATE = 0.19;
	const HANDOFF = 0.15;
	const FLICK = 110;
	const MAX_VELOCITY = 2000;
	const DEADZONE = 4;
	const SLOP = 10;
	const RUBBER = 0.55;
	const SIZES = {
		sm: { height: 28, font: 12, pad: 10, min: 36 },
		md: { height: 36, font: 13.5, pad: 14, min: 44 },
		lg: { height: 42, font: 15, pad: 16, min: 48 }
	};

	type Slot = { l: number; r: number };

	const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
	const rubber = (over: number, dim: number) =>
		(over * dim * RUBBER) / (dim + RUBBER * Math.abs(over));
	/** Distance a flick carries the thumb, from release velocity (px/s). */
	const project = (v: number, glide: number) => {
		const d = 1 - 0.1 * Math.pow(0.05, glide / 100);
		return ((v / 1000) * d) / (1 - d);
	};
	const velocityOf = (hist: [number, number][], now: number) => {
		const recent = hist.filter(([t]) => now - t <= 100);
		if (recent.length < 2) return 0;
		const [t0, x0] = recent[0];
		const [t1, x1] = recent[recent.length - 1];
		return t1 - t0 >= 8 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0;
	};
	const nearestSlot = (slots: Slot[], x: number) => {
		let best = 0;
		for (let i = 1; i < slots.length; i++) {
			const mid = (s: Slot) => (s.l + s.r) / 2;
			if (Math.abs(mid(slots[i]) - x) < Math.abs(mid(slots[best]) - x)) best = i;
		}
		return best;
	};
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { animate, motionValue, type MotionValue } from 'motion';

	interface Props {
		items: SegmentItem[];
		/** Selected value. Bindable; a value matching no item hides the thumb. */
		value?: string;
		/**
		 * Called on every commit. `source` tells link-mode callers whether the
		 * link's own click will navigate ('tap') or they must ('drag', 'key').
		 */
		onchange?: (value: string, index: number, source: 'tap' | 'drag' | 'key') => void;
		trackColor?: string;
		thumbColor?: string;
		textColor?: string;
		activeTextColor?: string;
		size?: keyof typeof SIZES;
		radius?: number;
		inset?: number;
		equalSlots?: boolean;
		/** How far a tap dilates the thumb across old and new slot (0 = plain slide). */
		stretch?: number;
		/** Px the trailing edge lands past the slot edge before relaxing. */
		squash?: number;
		/** Scales every phase together; 0.25 is slow motion. */
		speed?: number;
		/** How far a flick carries the thumb before it snaps. */
		glide?: number;
		draggable?: boolean;
		disabled?: boolean;
		/** Animate value changes that come from outside (e.g. browser back). */
		animateExternal?: boolean;
		/**
		 * Link mode: when set, taps and drags play the thumb animation first and
		 * hand navigation to this callback once the thumb has landed. Rendering
		 * the next page blocks the main thread, which would otherwise freeze the
		 * spring mid-flight. Without it, links navigate natively and instantly.
		 */
		onnavigate?: (href: string) => void;
		/**
		 * Extra control drawn at the end of slots whose item has `accessory: true`.
		 * Rendered twice: once live (`copy: false`) and once, decorative, inside
		 * the thumb (`copy: true`) so it takes the active colour with the label.
		 */
		accessory?: Snippet<[{ item: SegmentItem; index: number; copy: boolean }]>;
		class?: string;
		'aria-label'?: string;
	}

	let {
		items,
		value = $bindable(),
		onchange,
		trackColor = '#27272a',
		thumbColor = '#fafafa',
		textColor = '#fafafa',
		activeTextColor = '#18181b',
		size = 'md',
		radius = 10,
		inset = 3,
		equalSlots = true,
		stretch = 100,
		squash = 3,
		speed = 1,
		glide = 75,
		draggable = true,
		disabled = false,
		animateExternal = false,
		onnavigate,
		accessory,
		class: className = '',
		'aria-label': ariaLabel = 'Segmented control'
	}: Props = $props();

	const reduced = new MediaQuery('prefers-reduced-motion: reduce');

	const index = $derived(items.findIndex((item) => item.value === value));
	const isLinks = $derived(items.some((item) => item.href));
	const preset = $derived(SIZES[size] ?? SIZES.md);
	const thumbRadius = $derived(Math.max(0, radius - inset));

	let track: HTMLElement | undefined = $state();
	let thumb: HTMLElement | undefined = $state();
	const itemEls: HTMLElement[] = $state([]);
	/** Slot wrappers: what the thumb measures (label link + any accessory). */
	const slotEls: HTMLElement[] = $state([]);
	/** False until measured: the server-rendered active item is highlighted instead. */
	let ready = $state(false);
	let held = $state(false);
	let pressed = $state(-1);

	// Imperative animation state — deliberately not reactive (updated per frame).
	let slots: Slot[] = [];
	let box: DOMRect | null = null;
	let committed = -1;
	let handoff: ReturnType<typeof setTimeout> | undefined;
	let gen = 0;
	let suppressClick = false;
	let navTimer: ReturnType<typeof setTimeout> | undefined;

	/** Tap: stretch + leading-edge spring. Drag: the landing spring only. */
	const NAV_AFTER = { tap: HANDOFF + 0.2, drag: 0.25 };

	function scheduleNavigate(href: string, after: number) {
		clearTimeout(navTimer);
		if (!onnavigate) return;
		if (reduced.current) return onnavigate(href);
		navTimer = setTimeout(() => onnavigate(href), t(after) * 1000);
	}
	let drag: {
		id: number;
		x0: number;
		slot: number;
		onThumb: boolean;
		live: boolean;
		offset: number;
		w: number;
		hist: [number, number][];
	} | null = null;

	const edgeL: MotionValue<number> = motionValue(0);
	const edgeR: MotionValue<number> = motionValue(0);
	const innerW: MotionValue<number> = motionValue(0);

	const t = (seconds: number) => seconds / speed;

	/** Write the thumb's clip straight to the DOM: no component re-render per frame. */
	function render() {
		if (!thumb) return;
		const right = Math.max(0, innerW.get() - edgeR.get());
		const left = Math.max(0, edgeL.get());
		thumb.style.clipPath = `inset(0 ${right}px 0 ${left}px round ${thumbRadius}px)`;
	}

	function jumpTo(i: number) {
		const s = slots[i];
		if (!s) return;
		clearTimeout(handoff);
		gen += 1;
		edgeL.jump(s.l);
		edgeR.jump(s.r);
	}

	function measure() {
		if (!track) return;
		const rect = track.getBoundingClientRect();
		box = rect;
		slots = items.map((_, i) => {
			const el = slotEls[i];
			if (!el) return { l: 0, r: 0 };
			const r = el.getBoundingClientRect();
			return { l: r.left - rect.left - inset, r: r.right - rect.left - inset };
		});
		innerW.set(rect.width - inset * 2);
		if (committed >= 0) jumpTo(committed);
		render();
	}

	onMount(() => {
		committed = index;
		const unsubs = [edgeL, edgeR, innerW].map((mv) => mv.on('change', render));
		measure();
		ready = true;
		const observer = new ResizeObserver(measure);
		if (track) observer.observe(track);
		document.fonts?.ready.then(measure);
		return () => {
			observer.disconnect();
			unsubs.forEach((off) => off());
			clearTimeout(handoff);
			clearTimeout(navTimer);
			edgeL.stop();
			edgeR.stop();
		};
	});

	// Re-measure when the slot layout can change.
	$effect(() => {
		void [items.length, size, inset, equalSlots];
		if (ready) measure();
	});

	// Value changed from outside (not by this control's own commit).
	$effect(() => {
		const next = index;
		if (!ready || drag || committed === next) return;
		const from = committed;
		committed = next;
		if (next < 0) return; // thumb fades out where it is
		if (from < 0) appear(next);
		else if (animateExternal && !reduced.current) travel(from, next);
		else jumpTo(next);
	});

	function commit(i: number, source: 'tap' | 'drag' | 'key') {
		committed = i;
		if (i === index) return;
		value = items[i].value;
		onchange?.(items[i].value, i, source);
	}

	/** Coming back from "no selection": grow out of the slot's centre. */
	function appear(to: number) {
		const s = slots[to];
		if (!s) return;
		if (reduced.current) return jumpTo(to);
		const mid = (s.l + s.r) / 2;
		gen += 1;
		edgeL.jump(mid);
		edgeR.jump(mid);
		land(to, null, false, false);
	}

	function land(to: number, v: number | null, flick: boolean, withSquash: boolean) {
		const b = slots[to];
		if (!b) return;
		const g = ++gen;
		const dir = Math.sign((b.l + b.r) / 2 - (edgeL.get() + edgeR.get()) / 2) || 1;
		const [lead, leadTo, trail, trailTo] =
			dir > 0 ? [edgeR, b.r, edgeL, b.l] : [edgeL, b.l, edgeR, b.r];
		const velocityFor = (mv: MotionValue<number>) =>
			clamp(v === null ? mv.getVelocity() : v, -MAX_VELOCITY, MAX_VELOCITY);

		animate(lead, leadTo, {
			...(flick ? SPRING_MOMENTUM : SPRING_UI),
			duration: t(flick ? 0.4 : 0.3),
			velocity: velocityFor(lead)
		});
		const trailVelocity = velocityFor(trail);
		if (!withSquash || squash <= 0) {
			animate(trail, trailTo, { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity });
			return;
		}
		animate(trail, trailTo + dir * squash, {
			...SPRING_UI,
			duration: t(0.3),
			velocity: trailVelocity
		}).then(() => {
			if (gen === g) animate(trail, trailTo, { ...SPRING_RELAX, duration: t(0.16) });
		});
	}

	function travel(from: number, to: number) {
		const a = slots[from];
		const b = slots[to];
		if (!a || !b) return;
		clearTimeout(handoff);
		gen += 1;
		if (reduced.current) {
			edgeL.jump(b.l);
			edgeR.jump(b.r);
			return;
		}
		// Phase 1: dilate across both slots. Phase 2: hand off to the springs.
		const u = stretch / 100;
		const tween = { duration: t(DILATE), ease: EASE_OUT };
		animate(edgeL, b.l + (Math.min(a.l, b.l) - b.l) * u, tween);
		animate(edgeR, b.r + (Math.max(a.r, b.r) - b.r) * u, tween);
		handoff = setTimeout(() => land(to, null, false, true), t(HANDOFF) * 1000);
	}

	/** Select a slot by tap/click/Enter, animating from the current one. */
	function select(i: number) {
		if (i === committed) return;
		const from = committed;
		commit(i, 'tap');
		if (from < 0) appear(i);
		else travel(from, i);
	}

	const localX = (e: PointerEvent) => e.clientX - (box ? box.left : 0) - inset;

	function onPointerDown(e: PointerEvent, i: number) {
		suppressClick = false;
		if (disabled || drag || e.button !== 0 || !track) return;
		box = track.getBoundingClientRect();
		const x = localX(e);
		const onThumb = draggable && committed >= 0 && x >= edgeL.get() && x <= edgeR.get();
		drag = {
			id: e.pointerId,
			x0: x,
			slot: i,
			onThumb,
			live: false,
			offset: 0,
			w: 0,
			hist: [[e.timeStamp, x]]
		};
		// Capture so the release is always seen, even outside the track.
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			/* capture is best-effort */
		}
		if (onThumb) {
			clearTimeout(handoff);
			gen += 1;
			edgeL.stop();
			edgeR.stop();
		} else if (!reduced.current) {
			pressed = i;
		}
	}

	function onPointerMove(e: PointerEvent) {
		const d = drag;
		if (!d || e.pointerId !== d.id || !d.onThumb) return;
		const x = localX(e);
		d.hist.push([e.timeStamp, x]);
		if (d.hist.length > 8) d.hist.shift();
		if (!d.live) {
			if (Math.abs(x - d.x0) < DEADZONE) return;
			d.live = true;
			d.offset = x - edgeL.get();
			d.w = edgeR.get() - edgeL.get();
			held = true;
		}
		const width = innerW.get();
		const l = x - d.offset;
		const maxL = width - d.w;
		if (reduced.current) {
			const c = clamp(l, 0, maxL);
			edgeL.set(c);
			edgeR.set(c + d.w);
		} else if (l < 0) {
			edgeL.set(0);
			edgeR.set(d.w - rubber(-l, d.w));
		} else if (l > maxL) {
			edgeR.set(width);
			edgeL.set(maxL + rubber(l - maxL, d.w));
		} else {
			edgeL.set(l);
			edgeR.set(l + d.w);
		}
	}

	function release() {
		const d = drag!;
		drag = null;
		held = false;
		pressed = -1;
		return d;
	}

	function onPointerUp(e: PointerEvent) {
		const d = drag;
		if (!d || e.pointerId !== d.id) return;
		release();
		const x = localX(e);
		if (!d.live) {
			// A tap is completed by the click handler; a slide off the item cancels it.
			if (Math.abs(x - d.x0) > SLOP) suppressClick = true;
			return;
		}
		// The drag decides the slot; swallow the click that follows the release.
		suppressClick = true;
		const v = velocityOf(d.hist, e.timeStamp);
		const flick = Math.abs(v) > FLICK;
		let to = nearestSlot(slots, (edgeL.get() + edgeR.get()) / 2 + project(v, glide));
		if (flick && to === committed) to = clamp(to + Math.sign(v), 0, items.length - 1);
		const changed = to !== committed;
		commit(to, 'drag');
		if (reduced.current) jumpTo(to);
		else land(to, v, flick, flick);
		const href = items[to].href;
		if (changed && href) scheduleNavigate(href, NAV_AFTER.drag);
	}

	function onPointerCancel(e: PointerEvent) {
		const d = drag;
		if (!d || e.pointerId !== d.id) return;
		release();
		if (!d.live) return;
		if (reduced.current) jumpTo(committed);
		else land(committed, null, false, false);
	}

	function onClick(e: MouseEvent, i: number) {
		if (suppressClick) {
			suppressClick = false;
			e.preventDefault();
			return;
		}
		// Let the browser handle new-tab / new-window clicks untouched.
		if (disabled || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
		const href = items[i].href;
		if (href && onnavigate) {
			e.preventDefault();
			// Re-clicking the current page (e.g. to clear filters) navigates at once.
			if (i === committed) return scheduleNavigate(href, 0);
			select(i);
			scheduleNavigate(href, NAV_AFTER.tap);
			return;
		}
		select(i);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (disabled || isLinks) return; // links keep normal Tab navigation
		const last = items.length - 1;
		const cur = Math.max(0, index);
		let next: number | null = null;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(last, cur + 1);
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, cur - 1);
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = last;
		if (next === null) return;
		e.preventDefault();
		if (next === index) return;
		commit(next, 'key');
		jumpTo(next);
		itemEls[next]?.focus();
	}

	/** Room at the end of a slot for its accessory (a 1.75rem control). */
	const accessoryPad = 'pr-[calc(var(--rs-pad)*0.45+1.75rem)]';

	const itemBase =
		'inline-flex h-[calc(var(--rs-h)-var(--rs-inset)*2)] min-w-(--rs-min) items-center justify-center gap-1.5 rounded-(--rs-thumb-radius) px-(--rs-pad) text-(length:--rs-font) leading-none font-medium whitespace-nowrap [font-variation-settings:"wdth"_104]';
</script>

<div
	bind:this={track}
	role={isLinks ? undefined : 'radiogroup'}
	aria-label={isLinks ? undefined : ariaLabel}
	aria-disabled={disabled || undefined}
	class={[
		'group relative inline-grid grid-flow-col rounded-(--rs-radius) bg-(--rs-track) p-(--rs-inset) align-middle select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]',
		equalSlots ? 'auto-cols-[minmax(0,1fr)]' : 'auto-cols-auto',
		// pan-y keeps vertical page scroll; horizontal gestures belong to the thumb
		'touch-pan-y',
		held && 'cursor-grabbing',
		disabled && 'pointer-events-none opacity-50',
		className
	]}
	style:--rs-track={trackColor}
	style:--rs-thumb={thumbColor}
	style:--rs-ink={textColor}
	style:--rs-ink-active={activeTextColor}
	style:--rs-radius="{radius}px"
	style:--rs-inset="{inset}px"
	style:--rs-thumb-radius="{thumbRadius}px"
	style:--rs-h="{preset.height}px"
	style:--rs-font="{preset.font}px"
	style:--rs-pad="{preset.pad}px"
	style:--rs-min="{preset.min}px"
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerCancel}
	onlostpointercapture={onPointerCancel}
>
	{#each items as item, i (item.value)}
		{@const active = i === index}
		{@const hasAccessory = !!(item.accessory && accessory)}
		<div bind:this={slotEls[i]} class="relative flex">
			<svelte:element
				this={item.href ? 'a' : 'button'}
				bind:this={itemEls[i]}
				href={item.href}
				type={item.href ? undefined : 'button'}
				role={item.href ? undefined : 'radio'}
				aria-checked={item.href ? undefined : active}
				aria-current={item.href && active ? 'page' : undefined}
				tabindex={item.href ? undefined : active ? 0 : -1}
				disabled={!item.href && disabled ? true : undefined}
				draggable="false"
				class={[
					itemBase,
					hasAccessory && accessoryPad,
					'w-full text-(--rs-ink) outline-none',
					'transition-[opacity,transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity',
					'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--rs-thumb)',
					pressed === i && 'scale-96',
					active
						? draggable
							? 'cursor-grab'
							: 'cursor-default'
						: 'cursor-pointer opacity-70 hover:opacity-100',
					// Before hydration the active item paints its own thumb, so there's no flash
					!ready && active && 'bg-(--rs-thumb) text-(--rs-ink-active)',
					held && 'cursor-grabbing'
				]}
				onpointerdown={(e: PointerEvent) => onPointerDown(e, i)}
				onclick={(e: MouseEvent) => onClick(e, i)}
				onkeydown={onKeyDown}
			>
				{item.label}
			</svelte:element>
			{#if hasAccessory}
				<span
					class={[
						// Spans the whole slot so the accessory can anchor popovers to it; only
						// its own interactive children take pointer events.
						'pointer-events-none absolute inset-0 flex items-center justify-end pr-[calc(var(--rs-pad)*0.45)]',
						// before hydration the active slot paints its own thumb, so match its ink
						!ready && active ? 'text-(--rs-ink-active)' : 'text-(--rs-ink)'
					]}
				>
					{@render accessory!({ item, index: i, copy: false })}
				</span>
			{/if}
		</div>
	{/each}

	<!-- The thumb: a solid pill holding a second copy of every label in the
	     active colour, revealed through an animated clip-path. -->
	<div
		bind:this={thumb}
		aria-hidden="true"
		class={[
			'pointer-events-none absolute inset-(--rs-inset) grid grid-flow-col bg-(--rs-thumb) text-(--rs-ink-active) transition-opacity duration-200',
			equalSlots ? 'auto-cols-[minmax(0,1fr)]' : 'auto-cols-auto',
			ready && index >= 0 ? 'opacity-100' : 'opacity-0'
		]}
		style="clip-path: inset(0 100% 0 0)"
	>
		{#each items as item, i (item.value)}
			{#if item.accessory && accessory}
				<span class={[itemBase, accessoryPad, 'relative']}>
					{item.label}
					<span class="absolute inset-y-0 right-0 flex items-center pr-[calc(var(--rs-pad)*0.45)]">
						{@render accessory({ item, index: i, copy: true })}
					</span>
				</span>
			{:else}
				<span class={itemBase}>{item.label}</span>
			{/if}
		{/each}
	</div>
</div>
