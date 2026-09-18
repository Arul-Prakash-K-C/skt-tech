<script lang="ts">
	import type { Category } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { reveal } from '$lib/utils/motion';

	interface Props {
		categories: Category[];
	}

	let { categories }: Props = $props();
</script>

<!-- An index, not a card grid: category rows read like a catalogue contents page -->
<ul class="border-t border-line">
	{#each categories as c, i (c._id)}
		<li class="border-b border-line" {@attach reveal(i)}>
			<a href="/products?category={c.slug}" class="row group">
				<span class="thumb">
					<SanityImage
						image={c.image}
						width={160}
						aspect={4 / 3}
						sizes="160px"
						alt=""
						class="h-full w-full object-contain p-1.5"
					/>
				</span>
				<span class="min-w-0 flex-1">
					<span class="title">{c.title}</span>
					{#if c.description}<span class="desc">{c.description}</span>{/if}
				</span>
				{#if c.productCount !== undefined}
					<span class="count num"
						>{c.productCount} {c.productCount === 1 ? 'product' : 'products'}</span
					>
				{/if}
				<span class="go" aria-hidden="true"><Icon name="arrow" size={20} /></span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-block: 1.125rem;
		transition: background-color var(--dur-3) var(--ease-out);
	}
	@media (min-width: 768px) {
		.row {
			gap: 2rem;
			padding: 1.5rem 1rem;
			margin-inline: -1rem;
			border-radius: var(--radius-sm);
		}
		.row:hover {
			background: var(--color-stock);
		}
	}
	.thumb {
		flex-shrink: 0;
		width: 4.5rem;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-sm);
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		overflow: hidden;
	}
	@media (min-width: 768px) {
		.thumb {
			width: 6.5rem;
		}
	}
	.title {
		display: block;
		font-size: clamp(1.1875rem, 1rem + 0.9vw, 1.75rem);
		font-weight: 600;
		font-variation-settings: 'wdth' 114;
		letter-spacing: -0.018em;
		line-height: 1.15;
		color: var(--color-ink);
	}
	.desc {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.9375rem;
		color: var(--color-muted);
		max-width: 40rem;
	}
	.count {
		display: none;
		flex-shrink: 0;
		font-size: 0.875rem;
		color: var(--color-muted);
	}
	@media (min-width: 768px) {
		.count {
			display: block;
		}
	}
	.go {
		flex-shrink: 0;
		color: var(--color-subtle);
		transition:
			transform var(--dur-3) var(--ease-out),
			color var(--dur-2) var(--ease-out);
	}
	.row:hover .go {
		color: var(--color-cyan);
		transform: translateX(4px);
	}
</style>
