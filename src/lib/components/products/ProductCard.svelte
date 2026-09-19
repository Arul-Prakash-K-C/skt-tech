<script lang="ts">
	import type { ProductCard } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Price from '$lib/components/ui/Price.svelte';
	import { AVAILABILITY } from '$lib/utils/format';
	import { tintFor } from '$lib/utils/tint';

	interface Props {
		product: ProductCard;
		/** Heading level inside the surrounding section. */
		level?: 'h2' | 'h3';
		priority?: boolean;
	}

	let { product, level = 'h3', priority = false }: Props = $props();

	// A soft process-colour backdrop per category, so the grid reads by type at a glance
	const tint = $derived(tintFor(product.category?.slug ?? ''));

	const stock = $derived(AVAILABILITY[product.availability] ?? AVAILABILITY['in-stock']);
	// Show the brand, unless the product name already starts with it
	const eyebrow = $derived(
		product.brand && !product.name.toLowerCase().startsWith(product.brand.name.toLowerCase())
			? product.brand.name
			: product.category?.title
	);
</script>

<article class="card group">
	<div class="media" style:--tint={tint} style:view-transition-name="product-{product.slug}">
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
		border-radius: var(--radius-lg);
		background:
			radial-gradient(80% 70% at 50% 60%, rgb(255 255 255 / 0.85), transparent 70%), var(--tint);
		overflow: hidden;
	}
	.media :global(.img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 8%;
		transition: transform var(--dur-4) var(--ease-spring);
	}
	.card:hover .media :global(.img) {
		transform: translateY(-3%) scale(1.05);
	}
	.deal {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.375rem 0.625rem;
		border-radius: 999px;
		background: var(--color-process-magenta);
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
		border-radius: var(--radius-lg);
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
