<script lang="ts">
	import { page } from '$app/state';
	import { pushState, replaceState } from '$app/navigation';
	import type { GalleryCategory } from '$lib/sanity/types';
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHeader from '$lib/components/sections/PageHeader.svelte';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Lightbox from '$lib/components/gallery/Lightbox.svelte';
	import { imageUrl } from '$lib/sanity/image';
	import { revealImage } from '$lib/utils/motion';

	let { data } = $props();

	const LABELS: Record<GalleryCategory, string> = {
		installations: 'Installations',
		products: 'Card designs',
		events: 'Events',
		workshop: 'Our workshop'
	};

	let filter = $state<GalleryCategory | 'all'>('all');

	const present = $derived(
		(Object.keys(LABELS) as GalleryCategory[]).filter((c) =>
			data.items.some((i) => i.category === c)
		)
	);
	const visible = $derived(
		filter === 'all' ? data.items : data.items.filter((i) => i.category === filter)
	);
	const openIndex = $derived(visible.findIndex((i) => i._id === page.state.lightbox));

	function open(e: MouseEvent, id: string) {
		// Let modified clicks open the full image in a new tab
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();
		pushState('', { lightbox: id });
	}

	const intro =
		'Printers we have installed, cards we have printed and events where we have shown our work.';
</script>

<Seo title="Gallery" description={intro} image={data.items[0]?.image} />

<PageHeader title="Gallery" {intro} crumbs={[{ name: 'Home', href: '/' }, { name: 'Gallery' }]} />

<div class="shell py-10 md:py-14">
	{#if data.items.length}
		{#if present.length > 1}
			<div class="tabs" role="toolbar" aria-label="Filter gallery">
				<button class="tab" aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}>
					All <span class="num">{data.items.length}</span>
				</button>
				{#each present as c (c)}
					<button class="tab" aria-pressed={filter === c} onclick={() => (filter = c)}>
						{LABELS[c]} <span class="num">{data.items.filter((i) => i.category === c).length}</span>
					</button>
				{/each}
			</div>
		{/if}

		<ul class="masonry mt-8">
			{#each visible as item (item._id)}
				<li class="tile">
					<a
						href={imageUrl(item.image, { width: 2000 })}
						class="group block"
						onclick={(e) => open(e, item._id)}
					>
						<div class="media" {@attach revealImage}>
							<SanityImage
								image={item.image}
								width={520}
								sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
								class="w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
							/>
							<span class="zoom" aria-hidden="true"><Icon name="expand" size={18} /></span>
						</div>
						<div class="mt-3">
							<p class="font-medium text-ink">{item.title}</p>
							<p class="meta mt-0.5">{LABELS[item.category] ?? item.category}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<EmptyState
			title="No photos yet"
			text="We’re adding photos of recent installations and events. Check back soon."
		>
			<Button href="/products">Browse products</Button>
		</EmptyState>
	{/if}
</div>

{#if openIndex >= 0}
	<Lightbox
		items={visible}
		index={openIndex}
		onclose={() => history.back()}
		onnavigate={(i) => replaceState('', { lightbox: visible[i]._id })}
	/>
{/if}

<style>
	.tabs {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		scrollbar-width: none;
		padding-bottom: 2px;
	}
	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		height: 2.5rem;
		padding-inline: 1rem;
		border-radius: 999px;
		border: 1px solid var(--color-line-strong);
		background: var(--color-stock);
		font-size: 0.9375rem;
		font-weight: 520;
		color: var(--color-ink-2);
		white-space: nowrap;
		transition:
			background-color var(--dur-2) var(--ease-out),
			color var(--dur-2) var(--ease-out),
			border-color var(--dur-2) var(--ease-out);
	}
	.tab span {
		font-size: 0.8125rem;
		color: var(--color-subtle);
	}
	.tab:hover {
		border-color: var(--color-ink);
	}
	.tab[aria-pressed='true'] {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: white;
	}
	.tab[aria-pressed='true'] span {
		color: rgb(255 255 255 / 0.6);
	}
	.masonry {
		columns: 1;
		column-gap: 1.5rem;
	}
	@media (min-width: 640px) {
		.masonry {
			columns: 2;
		}
	}
	@media (min-width: 1024px) {
		.masonry {
			columns: 3;
		}
	}
	.tile {
		break-inside: avoid;
		margin-bottom: 2rem;
	}
	.media {
		position: relative;
		overflow: hidden;
		border-radius: var(--radius-card);
		background: var(--color-shade);
	}
	.zoom {
		position: absolute;
		right: 0.75rem;
		top: 0.75rem;
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.92);
		color: var(--color-ink);
		opacity: 0;
		transform: scale(0.9);
		transition:
			opacity var(--dur-2) var(--ease-out),
			transform var(--dur-2) var(--ease-out);
	}
	.group:hover .zoom,
	.group:focus-visible .zoom {
		opacity: 1;
		transform: none;
	}
</style>
