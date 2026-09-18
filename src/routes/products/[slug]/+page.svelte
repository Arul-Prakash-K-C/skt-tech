<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import Seo from '$lib/components/ui/Seo.svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import Price from '$lib/components/ui/Price.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import RichText from '$lib/components/ui/RichText.svelte';
	import ProductGallery from '$lib/components/products/ProductGallery.svelte';
	import SpecTable from '$lib/components/products/SpecTable.svelte';
	import ComparisonTable from '$lib/components/products/ComparisonTable.svelte';
	import ProductGrid from '$lib/components/products/ProductGrid.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import { AVAILABILITY, formatBytes, formatINR, phoneHref, pricing } from '$lib/utils/format';
	import { breadcrumbLd, productLd } from '$lib/utils/seo';

	let { data } = $props();

	const product = $derived(data.product);
	const settings = $derived(data.settings);
	const origin = $derived(env.PUBLIC_SITE_URL || page.url.origin);
	const stock = $derived(AVAILABILITY[product.availability] ?? AVAILABILITY['in-stock']);
	const price = $derived(pricing(product));
	const enquiryHref = $derived(
		`/contact?product=${encodeURIComponent(product.slug)}&subject=${encodeURIComponent(`Quote for ${product.name}`)}`
	);

	const crumbs = $derived([
		{ name: 'Home', href: '/' },
		{ name: 'Products', href: '/products' },
		...(product.category
			? [{ name: product.category.title, href: `/products?category=${product.category.slug}` }]
			: []),
		{ name: product.name, href: `/products/${product.slug}` }
	]);

	const sections = $derived(
		[
			(product.overview?.length || product.features?.length) && {
				id: 'overview',
				label: 'Overview'
			},
			product.specGroups?.length && { id: 'specifications', label: 'Specifications' },
			product.comparison && { id: 'compare', label: 'Compare' },
			product.documents?.length && { id: 'downloads', label: 'Downloads' }
		].filter((s): s is { id: string; label: string } => !!s)
	);

	const keySpecs = $derived(product.specGroups?.flatMap((g) => g.rows).slice(0, 4) ?? []);
</script>

<Seo
	title={product.seo?.title ?? product.name}
	description={product.seo?.description ?? product.shortDescription}
	image={product.seo?.image ?? product.images[0]}
	type="product"
	noIndex={product.seo?.noIndex}
	schema={[
		productLd(product, origin),
		breadcrumbLd(
			origin,
			crumbs.map((c) => ({ name: c.name, href: c.href }))
		)
	]}
/>

<div class="shell pt-6 pb-12 md:pt-8 md:pb-20">
	<Breadcrumbs items={crumbs} />

	<div class="mt-6 grid gap-10 md:mt-8 lg:grid-cols-12 lg:gap-14">
		<div class="min-w-0 lg:col-span-7">
			{#if product.images.length}
				<ProductGallery
					images={product.images}
					name={product.name}
					transitionName="product-{product.slug}"
				/>
			{/if}
		</div>

		<div class="min-w-0 lg:col-span-5 lg:pt-2">
			<div class="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
					{#if product.brand}
						<a
							href="/products?brand={product.brand.slug}"
							class="font-semibold text-cyan hover:underline">{product.brand.name}</a
						>
					{/if}
					{#if product.model}<span class="num text-muted">Model {product.model}</span>{/if}
				</div>
				<h1 class="h1 mt-3">{product.name}</h1>
				{#if product.shortDescription}<p class="lede mt-4">{product.shortDescription}</p>{/if}

				<div class="mt-8 border-t border-line pt-6">
					<Price mrp={product.mrp} discount={product.discount} size="lg" />
					{#if price && price.saving > 0}
						<p class="mt-1 text-sm text-muted">
							You save <span class="num">{formatINR(price.saving)}</span> on MRP. GST extra.
						</p>
					{:else if price}
						<p class="mt-1 text-sm text-muted">MRP, GST extra. Volume pricing on request.</p>
					{/if}
					<div class="mt-4">
						<Badge tone={stock.tone} dot>{stock.label}</Badge>
					</div>
				</div>

				<div class="mt-8 grid gap-3 sm:grid-cols-2">
					<Button href={enquiryHref} size="lg">Request a quote</Button>
					{#if settings.whatsapp}
						<Button
							href="https://wa.me/{phoneHref(settings.whatsapp).replace(
								'+',
								''
							)}?text={encodeURIComponent(`Hello, I'd like a quote for ${product.name}.`)}"
							variant="secondary"
							size="lg"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="whatsapp" size={18} />WhatsApp us
						</Button>
					{:else if settings.phone}
						<Button href="tel:{phoneHref(settings.phone)}" variant="secondary" size="lg"
							><Icon name="phone" size={18} />Call us</Button
						>
					{/if}
				</div>

				{#if keySpecs.length}
					<dl
						class="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line"
					>
						{#each keySpecs as row (row._key)}
							<div class="bg-stock p-4">
								<dt class="text-xs text-muted">{row.label}</dt>
								<dd class="num mt-1 text-[0.9375rem] font-medium text-ink">{row.value}</dd>
							</div>
						{/each}
					</dl>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if sections.length > 1}
	<nav class="subnav" aria-label="On this page">
		<ul class="shell flex gap-1 overflow-x-auto">
			{#each sections as s (s.id)}
				<li><a href="#{s.id}" class="subnav-link">{s.label}</a></li>
			{/each}
		</ul>
	</nav>
{/if}

{#if product.overview?.length || product.features?.length}
	<section id="overview" class="shell py-14 md:py-20" aria-labelledby="overview-h">
		<div class="grid gap-10 lg:grid-cols-12 lg:gap-14">
			<div class="lg:col-span-7">
				<h2 id="overview-h" class="h2">Overview</h2>
				<RichText value={product.overview} class="mt-6 text-[1.0625rem] leading-relaxed" />
			</div>
			{#if product.features?.length}
				<div class="lg:col-span-5">
					<h3 class="h3">Key features</h3>
					<ul class="mt-5 grid gap-3">
						{#each product.features as f (f)}
							<li class="flex gap-3 text-ink-2">
								<span
									class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-cyan-soft text-cyan"
									><Icon name="check" size={14} /></span
								>
								<span>{f}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</section>
{/if}

{#if product.specGroups?.length}
	<section
		id="specifications"
		class="border-t border-line bg-stock/60 py-14 md:py-20"
		aria-labelledby="specs-h"
	>
		<div class="shell">
			<h2 id="specs-h" class="h2">Technical specifications</h2>
			<div class="mt-8 md:mt-10"><SpecTable groups={product.specGroups} /></div>
		</div>
	</section>
{/if}

{#if product.comparison}
	<section id="compare" class="shell py-14 md:py-20" aria-labelledby="compare-h">
		<SectionHeading
			id="compare-h"
			title="Compare with similar products"
			intro={product.comparison.intro}
		/>
		<div class="mt-8 md:mt-10">
			<ComparisonTable
				current={product}
				others={product.comparison.products}
				attributes={product.comparison.attributes}
			/>
		</div>
	</section>
{/if}

{#if product.documents?.length}
	<section id="downloads" class="border-t border-line py-14 md:py-20" aria-labelledby="downloads-h">
		<div class="shell">
			<h2 id="downloads-h" class="h2">Downloads</h2>
			<ul class="mt-8 grid gap-3 md:grid-cols-2">
				{#each product.documents as doc (doc._key)}
					<li>
						<a href="{doc.url}?dl=" class="doc group" download>
							<span
								class="grid size-11 shrink-0 place-items-center rounded-sm bg-shade text-xs font-semibold text-ink-2 uppercase"
								>{doc.extension ?? 'pdf'}</span
							>
							<span class="min-w-0 flex-1">
								<span class="block truncate font-medium text-ink">{doc.title}</span>
								{#if doc.size}<span class="text-sm text-muted">{formatBytes(doc.size)}</span>{/if}
							</span>
							<Icon
								name="download"
								size={20}
								class="text-subtle transition-colors group-hover:text-cyan"
							/>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

{#if product.related.length}
	<section class="border-t border-line py-14 md:py-20" aria-labelledby="related-h">
		<div class="shell">
			<SectionHeading
				id="related-h"
				title="Goes well with"
				intro="Consumables and accessories customers usually order with this."
			/>
			<div class="mt-8 md:mt-10"><ProductGrid products={product.related} /></div>
		</div>
	</section>
{/if}

<section class="border-t border-line bg-ink text-white">
	<div class="shell flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
		<div>
			<h2 class="h3 text-white">Need {product.name} for your team?</h2>
			<p class="mt-2 text-white/70">
				Tell us the quantity and your location. We reply with a quote, usually within a working day.
			</p>
		</div>
		<Button href={enquiryHref} variant="inverse" size="lg">Request a quote</Button>
	</div>
</section>

<style>
	.subnav {
		position: sticky;
		top: var(--header-h);
		z-index: 30;
		background: rgb(255 255 255 / 0.92);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-block: 1px solid var(--color-line);
	}
	.subnav ul {
		scrollbar-width: none;
	}
	.subnav-link {
		display: inline-flex;
		align-items: center;
		height: 3rem;
		padding-inline: 0.875rem;
		font-size: 0.9375rem;
		font-weight: 540;
		color: var(--color-ink-2);
		white-space: nowrap;
		border-bottom: 2px solid transparent;
		transition:
			color var(--dur-2) var(--ease-out),
			border-color var(--dur-2) var(--ease-out);
	}
	.subnav-link:hover {
		color: var(--color-ink);
		border-bottom-color: var(--color-cyan);
	}
	section[id] {
		scroll-margin-top: calc(var(--header-h) + 3.5rem);
	}
	.doc {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-card);
		background: var(--color-stock);
		transition: border-color var(--dur-2) var(--ease-out);
	}
	.doc:hover {
		border-color: var(--color-line-strong);
	}
</style>
