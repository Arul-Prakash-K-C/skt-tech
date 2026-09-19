<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { animate } from 'motion';
	import { prefersReducedMotion } from '$lib/utils/motion';

	/**
	 * Svelte port of React Bits' TiltedCard. The card tilts toward the pointer
	 * on a spring, lifts slightly, and an optional caption follows the cursor,
	 * swinging with vertical movement. Overlay content floats 30px in front of
	 * the card, so it parallaxes against it.
	 *
	 * Mouse only: touch and pen, and reduced motion, get a still card. The
	 * caption is decorative (aria-hidden); the surrounding markup must carry
	 * the accessible name.
	 */

	interface Props {
		children: Snippet;
		/** Floats in front of the card; not interactive. */
		overlay?: Snippet;
		/** Text for the tooltip that follows the cursor. */
		caption?: string;
		/** Maximum tilt, in degrees. */
		rotateAmplitude?: number;
		scaleOnHover?: number;
		showTooltip?: boolean;
		class?: ClassValue;
	}

	let {
		children,
		overlay,
		caption,
		rotateAmplitude = 12,
		scaleOnHover = 1.05,
		showTooltip = true,
		class: className
	}: Props = $props();

	// Same feel as the original: heavy, well-damped springs
	const SPRING = { type: 'spring', stiffness: 100, damping: 30, mass: 2 } as const;
	const CAPTION_SPRING = { type: 'spring', stiffness: 350, damping: 30, mass: 1 } as const;

	let root: HTMLDivElement;
	let inner: HTMLDivElement;
	let tip: HTMLSpanElement | undefined = $state();
	let lastY = 0;

	const enabled = (e: PointerEvent) => e.pointerType === 'mouse' && !prefersReducedMotion();

	function onpointermove(e: PointerEvent) {
		if (!enabled(e)) return;
		const rect = root.getBoundingClientRect();
		const offsetX = e.clientX - rect.left - rect.width / 2;
		const offsetY = e.clientY - rect.top - rect.height / 2;

		animate(
			inner,
			{
				rotateX: (offsetY / (rect.height / 2)) * -rotateAmplitude,
				rotateY: (offsetX / (rect.width / 2)) * rotateAmplitude
			},
			SPRING
		);

		if (tip) {
			// Position tracks the cursor directly; only the swing is sprung
			tip.style.left = `${e.clientX - rect.left}px`;
			tip.style.top = `${e.clientY - rect.top}px`;
			animate(tip, { rotate: -(offsetY - lastY) * 0.6 }, CAPTION_SPRING);
		}
		lastY = offsetY;
	}

	function onpointerenter(e: PointerEvent) {
		if (!enabled(e)) return;
		animate(inner, { scale: scaleOnHover }, SPRING);
		if (tip) animate(tip, { opacity: 1 }, SPRING);
	}

	function onpointerleave(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		animate(inner, { rotateX: 0, rotateY: 0, scale: 1 }, SPRING);
		if (tip) animate(tip, { opacity: 0, rotate: 0 }, SPRING);
	}
</script>

<div
	bind:this={root}
	class={['relative [perspective:800px]', className]}
	role="presentation"
	{onpointermove}
	{onpointerenter}
	{onpointerleave}
>
	<div bind:this={inner} class="relative will-change-transform [transform-style:preserve-3d]">
		{@render children()}
		{#if overlay}
			<div class="pointer-events-none absolute inset-0 z-[2] [transform:translateZ(30px)]">
				{@render overlay()}
			</div>
		{/if}
	</div>

	{#if showTooltip && caption}
		<span
			bind:this={tip}
			class="pointer-events-none absolute top-0 left-0 z-[3] translate-x-3 translate-y-3 rounded-full bg-ink px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg max-sm:hidden"
			aria-hidden="true">{caption}</span
		>
	{/if}
</div>
