<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import PageHeader from '$lib/components/sections/PageHeader.svelte';
	import BrandMark from '$lib/components/brands/BrandMark.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { reveal } from '$lib/utils/motion';

	let { data } = $props();

	const intro =
		'We only sell brands we are authorised to service. That means genuine consumables, manufacturer warranty, and a technician in Chennai who knows the printer.';

	const host = (url: string) => {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	};
</script>

<Seo title="Brands" description={intro} />

<PageHeader
	title="Brands we carry"
	{intro}
	crumbs={[{ name: 'Home', href: '/' }, { name: 'Brands' }]}
/>

<div class="shell py-12 md:py-20">
	{#if data.brands.length}
		<ul class="grid gap-5 md:grid-cols-2">
			{#each data.brands as brand, i (brand._id)}
				<li class="brand" {@attach reveal(i % 2)}>
					<div class="logo">
						<BrandMark name={brand.name} logo={brand.logo} height={44} />
					</div>
					<div class="flex flex-1 flex-col p-6 md:p-8">
						<h2 class="h3">{brand.name}</h2>
						{#if brand.categories?.length}
							<ul class="mt-3 flex flex-wrap gap-2" aria-label="Categories">
								{#each brand.categories as c (c.slug)}
									<li>
										<a href="/products?category={c.slug}&brand={brand.slug}" class="tag"
											>{c.title}</a
										>
									</li>
								{/each}
							</ul>
						{/if}
						{#if brand.description}<p class="mt-4 text-ink-2">{brand.description}</p>{/if}
						<div class="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-7">
							{#if brand.productCount}
								<Button href="/products?brand={brand.slug}" size="sm">
									View {brand.productCount}
									{brand.productCount === 1 ? 'product' : 'products'}
								</Button>
							{/if}
							{#if brand.website}
								<a
									href={brand.website}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
								>
									{host(brand.website)}
									<Icon name="external" size={14} />
								</a>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<EmptyState
			title="Brand list coming soon"
			text="We’re updating the brands we carry. Ask us about a specific printer or card type."
		>
			<Button href="/contact">Contact us</Button>
		</EmptyState>
	{/if}
</div>

<style>
	.brand {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-lg);
		background: var(--color-stock);
		overflow: hidden;
	}
	.logo {
		display: flex;
		align-items: center;
		height: 7.5rem;
		padding-inline: 2rem;
		border-bottom: 1px solid var(--color-line);
		background: var(--color-paper);
		color: var(--color-ink);
	}
	.tag {
		display: inline-flex;
		align-items: center;
		height: 1.75rem;
		padding-inline: 0.625rem;
		border-radius: var(--radius-xs);
		background: var(--color-shade);
		font-size: 0.8125rem;
		color: var(--color-ink-2);
		transition: background-color var(--dur-2) var(--ease-out);
	}
	.tag:hover {
		background: var(--color-cyan-soft);
		color: var(--color-cyan-strong);
	}
</style>
