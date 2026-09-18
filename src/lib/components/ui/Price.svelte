<script lang="ts">
	import { formatINR, pricing } from '$lib/utils/format';

	interface Props {
		mrp?: number;
		discount?: number;
		size?: 'sm' | 'lg';
	}

	let { mrp, discount, size = 'sm' }: Props = $props();

	const p = $derived(pricing({ mrp, discount }));
</script>

{#if p}
	<div class={['price num', size]}>
		<span class="now">{formatINR(p.price)}</span>
		{#if p.discount > 0}
			<span class="was"><span class="sr-only">MRP </span><s>{formatINR(p.mrp)}</s></span>
			<span class="off">{p.discount}% off</span>
		{:else}
			<span class="was">MRP</span>
		{/if}
	</div>
{:else}
	<div class={['price', size]}><span class="request">Price on request</span></div>
{/if}

<style>
	.price {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 0.5rem;
		row-gap: 0.125rem;
	}
	.now {
		font-weight: 620;
		font-variation-settings: 'wdth' 108;
		color: var(--color-ink);
		letter-spacing: -0.01em;
	}
	.sm .now {
		font-size: 1.0625rem;
	}
	.lg .now {
		font-size: clamp(1.75rem, 1.4rem + 1vw, 2.25rem);
	}
	.was {
		font-size: 0.8125rem;
		color: var(--color-subtle);
	}
	.lg .was {
		font-size: 1rem;
	}
	.off {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-magenta);
	}
	.lg .off {
		font-size: 1rem;
	}
	.request {
		font-weight: 560;
		color: var(--color-ink-2);
	}
	.lg .request {
		font-size: 1.25rem;
	}
</style>
