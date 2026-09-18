<script lang="ts">
	import type { ProductCard } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Price from '$lib/components/ui/Price.svelte';
	import { AVAILABILITY } from '$lib/utils/format';

	interface Props {
		product: ProductCard;
		/** Heading level inside the surrounding section. */
		level?: 'h2' | 'h3';
		priority?: boolean;
	}

	let { product, level = 'h3', priority = false }: Props = $props();

	const stock = $derived(AVAILABILITY[product.availability] ?? AVAILABILITY['in-stock']);
	// Show the brand, unless the product name already starts with it
	const eyebrow = $derived(
		product.brand && !product.name.toLowerCase().startsWith(product.brand.name.toLowerCase())
			? product.brand.name
			: product.category?.title
	);
</script>

<article class="card group">
	<div class="media" style:view-transition-name="product-{product.slug}">
		{#if product.image}
			<SanityImage
				image={product.image}
				width={420}
				sizes="(min-width: 1280px) 20rem, (min-width: 768px) 30vw, 50vw"
				{priority}
				class="img"
			/>
		{/if}
		{#if product.discount && product.discount > 0 && product.mrp}
			<span class="deal num">{product.discount}% off</span>
		{/if}
	</div>

	<div class="mt-4 flex flex-1 flex-col">
		{#if eyebrow}<p class="meta">{eyebrow}</p>{/if}
		<svelte:element this={level} class="name">
			<a href="/products/{product.slug}" class="stretched">{product.name}</a>
		</svelte:element>
		<div class="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 pt-3">
			<Price mrp={product.mrp} discount={product.discount} />
			<span class={['stock', `stock-${stock.tone}`]}>{stock.label}</span>
		</div>
	</div>
</article>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.media {
		position: relative;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-card);
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		overflow: hidden;
		transition: border-color var(--dur-3) var(--ease-out);
	}
	.card:hover .media {
		border-color: var(--color-line-strong);
	}
	.media :global(.img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 6%;
		transition: transform var(--dur-4) var(--ease-out);
	}
	.card:hover .media :global(.img) {
		transform: scale(1.045);
	}
	.deal {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.3125rem 0.5rem;
		border-radius: var(--radius-xs);
		background: var(--color-magenta);
		color: white;
		font-size: 0.75rem;
		font-weight: 620;
		line-height: 1;
	}
	.name {
		margin-top: 0.25rem;
		font-size: 1.0625rem;
		font-weight: 580;
		font-variation-settings: 'wdth' 104;
		line-height: 1.3;
		letter-spacing: -0.008em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.name a {
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 1.5px;
		text-underline-offset: 3px;
		transition: text-decoration-color var(--dur-2) var(--ease-out);
	}
	.card:hover .name a {
		text-decoration-color: var(--color-cyan);
	}
	/* Whole card is the link target; keyboard focus ring wraps the card */
	.stretched::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card);
	}
	.stretched:focus-visible {
		outline: none;
	}
	.stretched:focus-visible::after {
		outline: 2px solid var(--color-cyan);
		outline-offset: 4px;
	}
	.stock {
		font-size: 0.8125rem;
		font-weight: 520;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.stock::before {
		content: '';
		width: 0.4375rem;
		height: 0.4375rem;
		border-radius: 50%;
		background: currentColor;
	}
	.stock-ok {
		color: var(--color-ok);
	}
	.stock-warn {
		color: var(--color-warn);
	}
	.stock-muted {
		color: var(--color-subtle);
	}
</style>
