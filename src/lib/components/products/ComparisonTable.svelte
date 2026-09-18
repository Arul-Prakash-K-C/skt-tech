<script lang="ts">
	import type { ComparedProduct, SpecGroup } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Price from '$lib/components/ui/Price.svelte';

	interface Props {
		current: ComparedProduct;
		others: ComparedProduct[];
		/** Spec labels to compare; values are read from each product's own specs. */
		attributes: string[];
	}

	let { current, others, attributes }: Props = $props();

	const columns = $derived([current, ...others]);

	const specValue = (groups: SpecGroup[] | undefined, label: string) => {
		const needle = label.trim().toLowerCase();
		for (const g of groups ?? []) {
			const row = g.rows?.find((r) => r.label.trim().toLowerCase() === needle);
			if (row) return row.value;
		}
		return undefined;
	};
</script>

<div class="scroller" role="region" aria-label="Product comparison" tabindex="-1">
	<table>
		<caption class="sr-only"
			>{current.name} compared with {others.map((o) => o.name).join(', ')}</caption
		>
		<thead>
			<tr>
				<td class="corner"></td>
				{#each columns as p, i (p._id)}
					<th scope="col" class={[i === 0 && 'this']}>
						<div class="head">
							<div class="thumb">
								<SanityImage
									image={p.image}
									width={160}
									aspect={4 / 3}
									sizes="10rem"
									alt=""
									class="h-full w-full object-contain p-2"
								/>
							</div>
							{#if i === 0}
								<span class="text-sm font-semibold">{p.name}</span>
								<span class="tag">This product</span>
							{:else}
								<a href="/products/{p.slug}" class="text-sm font-semibold hover:text-cyan"
									>{p.name}</a
								>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<tr>
				<th scope="row">Price</th>
				{#each columns as p, i (p._id)}
					<td class={[i === 0 && 'this']}><Price mrp={p.mrp} discount={p.discount} /></td>
				{/each}
			</tr>
			{#each attributes as attr (attr)}
				<tr>
					<th scope="row">{attr}</th>
					{#each columns as p, i (p._id)}
						{@const v = specValue(p.specGroups, attr)}
						<td class={['num', i === 0 && 'this']}>
							{#if v}{v}{:else}<span class="text-subtle" aria-label="Not listed">—</span>{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.scroller {
		/* Containing block for the sr-only caption, so it can't escape the scroll clip */
		position: relative;
		overflow-x: auto;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-card);
		background: var(--color-stock);
	}
	table {
		width: 100%;
		min-width: 40rem;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 0.9375rem;
	}
	th,
	td {
		padding: 0.875rem 1rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--color-line);
	}
	tbody tr:last-child > * {
		border-bottom: 0;
	}
	tbody th {
		font-weight: 500;
		color: var(--color-muted);
		white-space: nowrap;
	}
	/* Sticky label column so rows stay readable while scrolling on phones */
	tbody th,
	.corner {
		position: sticky;
		left: 0;
		z-index: 1;
		background: var(--color-stock);
		width: 11rem;
	}
	.this {
		background: var(--color-cyan-soft);
	}
	thead th.this {
		box-shadow: inset 0 3px 0 var(--color-cyan);
	}
	.head {
		display: grid;
		gap: 0.5rem;
		min-width: 9rem;
	}
	.thumb {
		width: 7rem;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-sm);
		background: white;
		border: 1px solid var(--color-line);
	}
	.tag {
		font-size: 0.75rem;
		font-weight: 560;
		color: var(--color-cyan-strong);
	}
</style>
