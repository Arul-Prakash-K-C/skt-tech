<script lang="ts">
	import type { Img } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	interface Props {
		images: Img[];
		name: string;
		/** Shared-element name matching the product card on the listing. */
		transitionName: string;
	}

	let { images, name, transitionName }: Props = $props();

	let current = $state(0);
	let zoom = $state(false);
	let origin = $state('50% 50%');
	let track: HTMLElement | undefined = $state();

	const count = $derived(images.length);

	function select(i: number) {
		current = (i + count) % count;
		// Mobile: keep the swipe track in step with the thumbnails
		track?.children[current]?.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center'
		});
	}

	function onMove(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		origin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
	}

	function onScroll() {
		if (!track) return;
		const i = Math.round(track.scrollLeft / track.clientWidth);
		if (i !== current) current = i;
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') select(current + 1);
		else if (e.key === 'ArrowLeft') select(current - 1);
		else return;
		e.preventDefault();
	}
</script>

<div class="gallery">
	<!-- Main stage: swipe track on touch, hover-zoom on desktop -->
	<!-- Focusable region so arrow keys can page through images -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="stage"
		role="region"
		aria-roledescription="image gallery"
		aria-label="{name} images, {current + 1} of {count}"
		tabindex={count > 1 ? 0 : -1}
		onkeydown={onKey}
		style:view-transition-name={transitionName}
	>
		<div class="track" bind:this={track} onscroll={onScroll}>
			{#each images as image, i (image.ref ?? image.url + i)}
				<div
					class="slide"
					role="presentation"
					onpointerenter={(e) => e.pointerType === 'mouse' && (zoom = true)}
					onpointerleave={() => (zoom = false)}
					onpointermove={onMove}
				>
					<SanityImage
						{image}
						width={720}
						sizes="(min-width: 1024px) 45vw, 100vw"
						priority={i === 0}
						class={['img', zoom && i === current && 'zoomed']}
						style="transform-origin: {origin}"
					/>
				</div>
			{/each}
		</div>

		{#if count > 1}
			<div class="arrows">
				<button class="arrow" aria-label="Previous image" onclick={() => select(current - 1)}
					><Icon name="chevron-left" size={18} /></button
				>
				<button class="arrow" aria-label="Next image" onclick={() => select(current + 1)}
					><Icon name="chevron-right" size={18} /></button
				>
			</div>
			<span class="counter num" aria-hidden="true">{current + 1} / {count}</span>
		{/if}
	</div>

	{#if count > 1}
		<ul class="thumbs" aria-label="Choose image">
			{#each images as image, i (image.ref ?? image.url + i)}
				<li>
					<button
						class={['thumb', i === current && 'on']}
						aria-label="Image {i + 1}"
						aria-current={i === current ? 'true' : undefined}
						onclick={() => select(i)}
					>
						<SanityImage
							{image}
							width={120}
							aspect={4 / 3}
							sizes="6rem"
							alt=""
							class="h-full w-full object-contain p-1"
						/>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.stage {
		position: relative;
		border-radius: var(--radius-lg);
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		overflow: hidden;
	}
	.track {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}
	.track::-webkit-scrollbar {
		display: none;
	}
	.slide {
		flex: 0 0 100%;
		aspect-ratio: 4 / 3;
		scroll-snap-align: center;
		overflow: hidden;
		cursor: zoom-in;
	}
	.slide :global(.img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 7%;
		transition: transform var(--dur-3) var(--ease-out);
	}
	.slide :global(.img.zoomed) {
		transform: scale(1.75);
	}
	.arrows {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		display: none;
		gap: 0.375rem;
	}
	@media (min-width: 768px) {
		.arrows {
			display: flex;
		}
	}
	.arrow {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		box-shadow: var(--shadow-lift);
		transition: border-color var(--dur-2) var(--ease-out);
	}
	.arrow:hover {
		border-color: var(--color-ink);
	}
	.counter {
		position: absolute;
		left: 0.875rem;
		bottom: 0.875rem;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-xs);
		background: rgb(255 255 255 / 0.9);
		font-size: 0.75rem;
		color: var(--color-muted);
	}
	.thumbs {
		display: flex;
		gap: 0.625rem;
		margin-top: 0.75rem;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.thumb {
		display: block;
		width: 5.5rem;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-sm);
		background: var(--color-stock);
		border: 1.5px solid var(--color-line);
		overflow: hidden;
		transition: border-color var(--dur-2) var(--ease-out);
	}
	.thumb:hover {
		border-color: var(--color-line-strong);
	}
	.thumb.on {
		border-color: var(--color-ink);
	}
</style>
