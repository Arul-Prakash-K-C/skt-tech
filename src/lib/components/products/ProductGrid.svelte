<script lang="ts">
	import type { ProductCard as Product } from '$lib/sanity/types';
	import { reveal } from '$lib/utils/motion';
	import ProductCard from './ProductCard.svelte';

	interface Props {
		products: Product[];
		level?: 'h2' | 'h3';
		/** Stagger cards into view (home/related); off for filtered results. */
		animate?: boolean;
		columns?: 3 | 4;
	}

	let { products, level = 'h3', animate = true, columns = 4 }: Props = $props();
</script>

<ul
	class={[
		'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3',
		columns === 4 && 'xl:grid-cols-4'
	]}
>
	{#each products as product, i (product._id)}
		{#if animate}
			<li {@attach reveal(i % 4)}>
				<ProductCard {product} {level} />
			</li>
		{:else}
			<li>
				<ProductCard {product} {level} priority={i < 4} />
			</li>
		{/if}
	{/each}
</ul>
