<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import Icon, { type IconName } from '$lib/components/ui/Icon.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import { Reel, type ReelItem } from './circular-reel';

	interface Props {
		items: ReelItem[];
		/** Accessible name for the reel. */
		label: string;
		/** Curvature; positive bends the ends down, negative up. */
		bend?: number;
		/** Corner radius as a fraction of card height. */
		borderRadius?: number;
		textColor?: string;
		/** Drag / wheel multiplier. */
		scrollSpeed?: number;
		/** Easing per frame, 0–1. Lower is smoother. */
		scrollEase?: number;
		/** Idle drift in cards per minute; 0 disables it. */
		drift?: number;
		/** Called with the item index when a card is clicked or its button pressed. */
		onactivate?: (index: number) => void;
		/** Label of the button that opens the card in front. */
		openLabel?: string;
		/** Short usage hint beside the counter on wider screens. */
		hint?: string;
		class?: ClassValue;
	}

	let {
		items,
		label,
		bend = 3,
		borderRadius = 0.06,
		textColor = '#0f2233',
		scrollSpeed = 1,
		scrollEase = 0.075,
		drift = 5,
		onactivate,
		openLabel = 'Open this photo',
		hint = 'Drag or swipe sideways · click a photo to enlarge',
		class: className
	}: Props = $props();

	let reel: Reel | undefined = $state();
	let failed = $state(false);
	let paused = $state(false);
	let active = $state(0);
	/** Announce the current card only while the reel isn't moving by itself. */
	let announce = $state(false);

	const current = $derived(items[active]);

	const mount: Attachment<HTMLElement> = (el) => {
		let instance: Reel | undefined;
		let cancelled = false;
		const reduced = prefersReducedMotion();
		paused = reduced || drift <= 0;

		(async () => {
			try {
				// Captions are drawn to canvas, so the web font must be ready first
				await document.fonts?.load('600 64px "Archivo Variable"').catch(() => {});
				if (cancelled) return;
				instance = new Reel(el, {
					items,
					bend,
					borderRadius,
					textColor,
					scrollSpeed,
					scrollEase,
					drift,
					paused,
					reducedMotion: reduced,
					fontFamily: '"Archivo Variable", ui-sans-serif, system-ui, sans-serif',
					fontWeight: 600,
					placeholderColor: '#e8ecef',
					onchange: (i) => (active = i),
					onactivate: (i) => onactivate?.(i)
				});
				reel = instance;
			} catch (error) {
				// No WebGL: hide the reel; the photo grid below still lists everything
				console.warn('CircularGallery: could not start, showing the grid only', error);
				failed = true;
			}
		})();

		return () => {
			cancelled = true;
			instance?.destroy();
			reel = undefined;
		};
	};

	function togglePause() {
		paused = !paused;
		reel?.setPaused(paused);
		announce = paused;
	}

	function step(d: 1 | -1) {
		announce = true;
		d > 0 ? reel?.next() : reel?.prev();
	}

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

{#if !failed}
	<section class={['relative', className]} aria-roledescription="carousel" aria-label={label}>
		<!-- Sits in the page's content column, like everything else on the page -->
		<div class="shell">
			{#key items}
				<div
					{@attach mount}
					class={[
						'relative h-[clamp(14rem,34vw,24rem)] w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing',
						'[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]',
						'rounded-card outline-none',
						// Fade in once the first frame is drawn, so there's no blank flash
						'transition-opacity duration-700 ease-out',
						reel ? 'opacity-100' : 'opacity-0'
					]}
					aria-hidden="true"
				></div>
			{/key}
		</div>

		<div class="shell mt-2 flex items-center justify-between gap-4 md:mt-4">
			<p class="num flex min-w-0 items-baseline gap-3 text-sm text-muted">
				<span class="font-semibold text-ink">{pad(active + 1)}</span>
				<span class="h-px w-8 shrink-0 translate-y-[-0.3em] bg-line-strong" aria-hidden="true"
				></span>
				<span>{pad(items.length)}</span>
				<span class="ml-2 hidden truncate md:inline">
					{hint}
				</span>
			</p>

			<div class="flex shrink-0 items-center gap-1.5">
				{#snippet control(icon: IconName, name: string, onclick: () => void)}
					<button
						type="button"
						class="grid size-11 place-items-center rounded-full border border-line-strong bg-stock text-ink transition-[background-color,border-color,color,transform] duration-200 ease-out hover:border-ink hover:bg-ink hover:text-white active:scale-95 disabled:opacity-40"
						aria-label={name}
						disabled={!reel}
						{onclick}
					>
						<Icon name={icon} size={18} />
					</button>
				{/snippet}

				{@render control('chevron-left', 'Previous photo', () => step(-1))}
				{#if drift > 0}
					{@render control(
						paused ? 'play' : 'pause',
						paused ? 'Play slideshow' : 'Pause slideshow',
						togglePause
					)}
				{/if}
				{@render control('chevron-right', 'Next photo', () => step(1))}
				{#if onactivate}
					{@render control('expand', openLabel, () => onactivate(active))}
				{/if}
			</div>
		</div>

		<p class="sr-only" aria-live={announce ? 'polite' : 'off'} aria-atomic="true">
			{#if current}{current.text}, {active + 1} of {items.length}{/if}
		</p>
	</section>
{/if}
