<script lang="ts">
	import type { GalleryItem } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { formatDate } from '$lib/utils/format';
	import { modal } from '$lib/utils/dialog';

	interface Props {
		items: GalleryItem[];
		index: number;
		onclose: () => void;
		onnavigate: (index: number) => void;
	}

	let { items, index, onclose, onnavigate }: Props = $props();

	let touchX = 0;

	const item = $derived(items[index]);
	const many = $derived(items.length > 1);

	const step = (d: number) => onnavigate((index + d + items.length) % items.length);

	function onkeydown(e: KeyboardEvent) {
		if (!many) return;
		if (e.key === 'ArrowRight') step(1);
		if (e.key === 'ArrowLeft') step(-1);
	}
</script>

<dialog
	data-lenis-prevent
	{@attach modal(true)}
	class="lightbox"
	aria-label={item?.title}
	oncancel={(e) => {
		e.preventDefault();
		onclose();
	}}
	{onkeydown}
	onclick={(e) => e.target === e.currentTarget && onclose()}
	ontouchstart={(e) => (touchX = e.touches[0].clientX)}
	ontouchend={(e) => {
		const dx = e.changedTouches[0].clientX - touchX;
		if (many && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
	}}
>
	{#if item}
		<div class="frame">
			<button class="close" aria-label="Close" onclick={onclose}
				><Icon name="close" size={22} /></button
			>

			{#key item._id}
				<figure class="figure">
					<div class="media">
						<SanityImage
							image={item.image}
							width={1400}
							sizes="90vw"
							priority
							class="max-h-full w-auto max-w-full object-contain"
						/>
					</div>
					<figcaption class="caption">
						<div>
							<p class="font-semibold text-white">{item.title}</p>
							{#if item.description}<p class="mt-1 max-w-2xl text-sm text-white/70">
									{item.description}
								</p>{/if}
						</div>
						<p class="num shrink-0 text-sm text-white/50">
							{#if item.date}{formatDate(item.date)}{/if}
							{#if many}<span class="ml-3">{index + 1} / {items.length}</span>{/if}
						</p>
					</figcaption>
				</figure>
			{/key}

			{#if many}
				<button class="nav prev" aria-label="Previous image" onclick={() => step(-1)}
					><Icon name="chevron-left" size={24} /></button
				>
				<button class="nav next" aria-label="Next image" onclick={() => step(1)}
					><Icon name="chevron-right" size={24} /></button
				>
			{/if}
		</div>
	{/if}
</dialog>

<style>
	.lightbox {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100vw;
		max-width: 100vw;
		height: 100dvh;
		max-height: 100dvh;
		background: rgb(10 22 33 / 0.94);
		color: white;
	}
	.lightbox[open] {
		animation: fade var(--dur-3) var(--ease-out);
	}
	.lightbox::backdrop {
		background: transparent;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	.frame {
		position: relative;
		display: grid;
		height: 100%;
		padding: clamp(3.5rem, 6vw, 4.5rem) clamp(0.75rem, 6vw, 6rem) 1.25rem;
	}
	.figure {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: 1rem;
		min-height: 0;
		animation: pop var(--dur-3) var(--ease-out);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.985);
		}
	}
	.media {
		display: grid;
		place-items: center;
		min-height: 0;
	}
	.media :global(img) {
		max-height: calc(100dvh - 12rem);
		border-radius: var(--radius-sm);
	}
	.caption {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem 2rem;
		max-width: 72rem;
		width: 100%;
		margin-inline: auto;
	}
	.close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		color: white;
		transition: background-color var(--dur-2) var(--ease-out);
	}
	.close:hover,
	.nav:hover {
		background: rgb(255 255 255 / 0.12);
	}
	.nav {
		position: absolute;
		top: 50%;
		display: none;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		color: white;
		transform: translateY(-50%);
		transition: background-color var(--dur-2) var(--ease-out);
	}
	@media (min-width: 768px) {
		.nav {
			display: grid;
		}
	}
	.prev {
		left: 1rem;
	}
	.next {
		right: 1rem;
	}
</style>
