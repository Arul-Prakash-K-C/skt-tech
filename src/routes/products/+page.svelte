<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHeader from '$lib/components/sections/PageHeader.svelte';
	import ProductGrid from '$lib/components/products/ProductGrid.svelte';
	import ProductFilters from '$lib/components/products/ProductFilters.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { modal } from '$lib/utils/dialog';
	import {
		SORTS,
		applyFilters,
		facetCounts,
		readFilters,
		writeFilters,
		type Filters
	} from '$lib/utils/catalogue';

	let { data } = $props();

	const catalogue = $derived(data.catalogue);
	const filters = $derived(readFilters(page.url.searchParams));
	const results = $derived(applyFilters(catalogue.products, filters));
	const counts = $derived(facetCounts(catalogue.products, filters));

	const activeCategory = $derived(catalogue.categories.find((c) => c.slug === filters.category));
	const activeBrand = $derived(catalogue.brands.find((b) => b.slug === filters.brand));
	const activeCount = $derived(
		[filters.category, filters.brand, filters.inStock, filters.q].filter(Boolean).length
	);

	// Writable derived: follows the URL, but typing updates it immediately.
	let q = $derived(filters.q);
	let sheetOpen = $state(false);
	let searchTimer: ReturnType<typeof setTimeout>;

	function update(patch: Partial<Filters>) {
		goto(`/products${writeFilters({ ...filters, ...patch })}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function onSearch(value: string) {
		q = value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => update({ q: value.trim() }), 250);
	}

	const title = $derived(
		activeCategory?.title ?? (activeBrand ? `${activeBrand.name} products` : 'Products')
	);
	const intro = $derived(
		activeCategory?.description ??
			'ID card printers, ribbons, cards and accessories from the brands we are authorised to sell and service.'
	);
</script>

<Seo {title} description={intro} />

<PageHeader
	{title}
	{intro}
	crumbs={[
		{ name: 'Home', href: '/' },
		{ name: 'Products', href: '/products' },
		...(activeCategory ? [{ name: activeCategory.title }] : [])
	]}
/>

<div class="shell grid gap-10 py-10 lg:grid-cols-[15.5rem_1fr] lg:gap-14 lg:py-14">
	<!-- Desktop filters -->
	<aside class="hidden lg:block" aria-label="Filters">
		<form
			method="get"
			action="/products"
			class="sticky top-[calc(var(--header-h)+1.5rem)]"
			onsubmit={(e) => e.preventDefault()}
		>
			<ProductFilters
				{filters}
				{counts}
				categories={catalogue.categories}
				brands={catalogue.brands}
				onchange={update}
				idPrefix="side"
			/>
			<noscript><button class="mt-6 underline">Apply filters</button></noscript>
		</form>
	</aside>

	<div class="min-w-0">
		<!-- Toolbar -->
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<form
				role="search"
				class="relative flex-1"
				method="get"
				action="/products"
				onsubmit={(e) => {
					e.preventDefault();
					clearTimeout(searchTimer);
					update({ q: q.trim() });
				}}
			>
				<label for="product-search" class="sr-only">Search products</label>
				<Icon
					name="search"
					size={18}
					class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle"
				/>
				<input
					id="product-search"
					type="search"
					name="q"
					value={q}
					oninput={(e) => onSearch(e.currentTarget.value)}
					placeholder="Search by name, model or brand"
					autocomplete="off"
					class="h-11 w-full rounded-sm border border-line-strong bg-stock pr-3 pl-10 text-[0.9375rem] transition-colors placeholder:text-subtle hover:border-subtle focus:border-cyan focus:outline-none"
				/>
			</form>
			<div class="flex gap-3">
				<Button
					variant="secondary"
					class="flex-1 lg:hidden"
					aria-haspopup="dialog"
					onclick={() => (sheetOpen = true)}
				>
					<Icon name="filter" size={18} />
					Filters{activeCount ? ` (${activeCount})` : ''}
				</Button>
				<label class="relative flex-1 sm:flex-none">
					<span class="sr-only">Sort by</span>
					<select
						class="h-11 w-full appearance-none rounded-sm border border-line-strong bg-stock pr-10 pl-3.5 text-[0.9375rem] transition-colors hover:border-subtle focus:border-cyan focus:outline-none"
						value={filters.sort}
						onchange={(e) => update({ sort: e.currentTarget.value as Filters['sort'] })}
					>
						{#each SORTS as s (s.value)}
							<option value={s.value}>{s.label}</option>
						{/each}
					</select>
					<Icon
						name="chevron-down"
						size={16}
						class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
					/>
				</label>
			</div>
		</div>

		<!-- Result summary + active filter chips -->
		<div class="mt-5 flex flex-wrap items-center gap-2" aria-live="polite">
			<p class="mr-2 text-sm text-muted">
				<span class="num font-semibold text-ink">{results.length}</span>
				{results.length === 1 ? 'product' : 'products'}
			</p>
			{#if activeCategory}
				<button
					class="chip"
					onclick={() => update({ category: '' })}
					aria-label="Remove filter {activeCategory.title}"
				>
					{activeCategory.title}<Icon name="close" size={14} />
				</button>
			{/if}
			{#if activeBrand}
				<button
					class="chip"
					onclick={() => update({ brand: '' })}
					aria-label="Remove filter {activeBrand.name}"
				>
					{activeBrand.name}<Icon name="close" size={14} />
				</button>
			{/if}
			{#if filters.inStock}
				<button
					class="chip"
					onclick={() => update({ inStock: false })}
					aria-label="Remove filter In stock only"
				>
					In stock<Icon name="close" size={14} />
				</button>
			{/if}
			{#if filters.q}
				<button
					class="chip"
					onclick={() => update({ q: '' })}
					aria-label="Clear search {filters.q}"
				>
					“{filters.q}”<Icon name="close" size={14} />
				</button>
			{/if}
			{#if activeCount > 1}
				<button
					class="ml-1 text-sm font-medium text-cyan hover:underline"
					onclick={() => update({ q: '', category: '', brand: '', inStock: false })}
				>
					Clear all
				</button>
			{/if}
		</div>

		<div class="mt-8">
			{#if results.length}
				<ProductGrid products={results} level="h2" animate={false} columns={3} />
			{:else}
				<EmptyState
					title="No products match these filters"
					text="Try another category, or remove a filter. If you can’t find what you need, we can usually source it."
				>
					<Button
						variant="secondary"
						onclick={() => update({ q: '', category: '', brand: '', inStock: false })}
						>Clear filters</Button
					>
					<Button
						href="/contact?subject={encodeURIComponent(
							`Product enquiry${filters.q ? `: ${filters.q}` : ''}`
						)}">Ask us</Button
					>
				</EmptyState>
			{/if}
		</div>
	</div>
</div>

<!-- Mobile filter sheet -->
<dialog
	{@attach modal(sheetOpen)}
	class="sheet lg:hidden"
	aria-label="Filters"
	onclose={() => (sheetOpen = false)}
	onclick={(e) => e.target === e.currentTarget && (sheetOpen = false)}
>
	<form
		method="get"
		action="/products"
		class="panel"
		onsubmit={(e) => {
			e.preventDefault();
			sheetOpen = false;
		}}
	>
		<div class="flex items-center justify-between border-b border-line px-5 py-4">
			<h2 class="text-lg font-semibold">Filters</h2>
			<button
				type="button"
				class="grid size-10 place-items-center rounded-sm hover:bg-shade"
				aria-label="Close filters"
				onclick={() => (sheetOpen = false)}
			>
				<Icon name="close" size={20} />
			</button>
		</div>
		<div class="flex-1 overflow-y-auto px-5 py-6">
			<ProductFilters
				{filters}
				{counts}
				categories={catalogue.categories}
				brands={catalogue.brands}
				onchange={update}
				idPrefix="sheet"
			/>
		</div>
		<div class="border-t border-line p-4">
			<Button type="submit" size="lg" class="w-full">
				Show {results.length}
				{results.length === 1 ? 'product' : 'products'}
			</Button>
		</div>
	</form>
</dialog>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		height: 2rem;
		padding-inline: 0.75rem 0.5rem;
		border-radius: 999px;
		background: var(--color-ink);
		color: white;
		font-size: 0.8125rem;
		font-weight: 520;
		transition: background-color var(--dur-2) var(--ease-out);
	}
	.chip:hover {
		background: var(--color-cyan-strong);
	}

	.sheet {
		margin: auto 0 0;
		padding: 0;
		border: 0;
		width: 100%;
		max-width: 100%;
		max-height: 88dvh;
		background: transparent;
	}
	.sheet::backdrop {
		background: rgb(15 34 51 / 0.4);
	}
	.panel {
		display: flex;
		flex-direction: column;
		max-height: 88dvh;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		background: var(--color-paper);
		transform: translateY(0);
		transition: transform var(--dur-3) var(--ease-out);
	}
	@starting-style {
		.sheet[open] .panel {
			transform: translateY(100%);
		}
	}
</style>
