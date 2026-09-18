<script lang="ts">
	import type { BrandSummary, Category } from '$lib/sanity/types';
	import type { Filters } from '$lib/utils/catalogue';
	import type { facetCounts } from '$lib/utils/catalogue';

	interface Props {
		filters: Filters;
		counts: ReturnType<typeof facetCounts>;
		categories: Pick<Category, '_id' | 'title' | 'slug'>[];
		brands: BrandSummary[];
		onchange: (patch: Partial<Filters>) => void;
		/** Unique prefix so the panel can render twice (sidebar + mobile sheet). */
		idPrefix: string;
	}

	let { filters, counts, categories, brands, onchange, idPrefix }: Props = $props();
</script>

{#snippet option(group: 'category' | 'brand', value: string, label: string, count: number)}
	{@const checked = filters[group] === value}
	<li>
		<label class={['opt', checked && 'on', count === 0 && !checked && 'empty']}>
			<input
				class="sr-only"
				type="radio"
				name={group}
				{value}
				{checked}
				onchange={() => onchange({ [group]: value })}
			/>
			<span class="flex-1">{label}</span>
			<span class="num text-xs text-subtle">{count}</span>
		</label>
	</li>
{/snippet}

<div class="grid gap-8">
	<fieldset>
		<legend class="legend">Category</legend>
		<ul class="grid gap-0.5">
			{@render option('category', '', 'All categories', counts.allCategories)}
			{#each categories as c (c._id)}
				{@render option('category', c.slug, c.title, counts.category.get(c.slug) ?? 0)}
			{/each}
		</ul>
	</fieldset>

	{#if brands.length}
		<fieldset>
			<legend class="legend">Brand</legend>
			<ul class="grid gap-0.5">
				{@render option('brand', '', 'All brands', counts.allBrands)}
				{#each brands as b (b._id)}
					{@render option('brand', b.slug, b.name, counts.brand.get(b.slug) ?? 0)}
				{/each}
			</ul>
		</fieldset>
	{/if}

	<fieldset>
		<legend class="legend">Availability</legend>
		<label class="switch" for="{idPrefix}-stock">
			<input
				id="{idPrefix}-stock"
				type="checkbox"
				name="stock"
				value="1"
				class="peer sr-only"
				checked={filters.inStock}
				onchange={(e) => onchange({ inStock: e.currentTarget.checked })}
			/>
			<span class="track" aria-hidden="true"></span>
			<span>In stock only</span>
		</label>
	</fieldset>
</div>

<style>
	fieldset {
		min-width: 0;
	}
	.legend {
		margin-bottom: 0.625rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink);
	}
	.opt {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 2.5rem;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.9375rem;
		color: var(--color-ink-2);
		cursor: pointer;
		transition:
			background-color var(--dur-1) var(--ease-out),
			color var(--dur-1) var(--ease-out);
	}
	.opt:hover {
		background: var(--color-shade);
	}
	.opt::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.5rem;
		bottom: 0.5rem;
		width: 3px;
		border-radius: 2px;
		background: var(--color-cyan);
		transform: scaleY(0);
		transition: transform var(--dur-2) var(--ease-out);
	}
	.opt.on {
		background: var(--color-stock);
		color: var(--color-ink);
		font-weight: 580;
		box-shadow: inset 0 0 0 1px var(--color-line);
	}
	.opt.on::before {
		transform: scaleY(1);
	}
	.opt.empty {
		color: var(--color-subtle);
	}
	.opt:has(:focus-visible) {
		outline: 2px solid var(--color-cyan);
		outline-offset: 1px;
	}

	.switch {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 2.5rem;
		font-size: 0.9375rem;
		color: var(--color-ink-2);
		cursor: pointer;
	}
	.track {
		position: relative;
		flex-shrink: 0;
		width: 2.5rem;
		height: 1.5rem;
		border-radius: 999px;
		background: var(--color-line-strong);
		transition: background-color var(--dur-2) var(--ease-out);
	}
	.track::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 50%;
		background: white;
		box-shadow: 0 1px 2px rgb(15 34 51 / 0.25);
		transition: transform var(--dur-2) var(--ease-spring);
	}
	:global(.peer:checked) + .track {
		background: var(--color-cyan);
	}
	:global(.peer:checked) + .track::after {
		transform: translateX(1rem);
	}
	:global(.peer:focus-visible) + .track {
		outline: 2px solid var(--color-cyan);
		outline-offset: 2px;
	}
</style>
