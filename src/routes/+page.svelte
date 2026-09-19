<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import Seo from '$lib/components/ui/Seo.svelte';
	import HeroCard from '$lib/components/hero/HeroCard.svelte';
	import BrandStrip from '$lib/components/brands/BrandStrip.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import CategoryIndex from '$lib/components/sections/CategoryIndex.svelte';
	import CircularGallery from '$lib/components/gallery/CircularGallery.svelte';
	import ProductGrid from '$lib/components/products/ProductGrid.svelte';
	import Offers from '$lib/components/sections/Offers.svelte';
	import ContactPrompt from '$lib/components/sections/ContactPrompt.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { imageUrl } from '$lib/sanity/image';
	import { organizationLd } from '$lib/utils/seo';
	import { tintFor } from '$lib/utils/tint';

	let { data } = $props();

	const home = $derived(data.home);
	const origin = $derived(env.PUBLIC_SITE_URL || page.url.origin);

	// Categories become the same reel as the gallery once enough have artwork;
	// otherwise the plain list keeps every category reachable.
	const reelCategories = $derived(home.categories.filter((c) => c.image));
	const useReel = $derived(reelCategories.length >= 3);
	const reelItems = $derived(
		reelCategories.map((c) => ({
			image: imageUrl(c.image, { width: 1280, aspect: 1.586 }),
			text: c.title,
			background: tintFor(c.slug)
		}))
	);

	// Four is a row on desktop and two rows on mobile; the catalogue has the rest
	const featured = $derived(home.featuredProducts.slice(0, 4));
</script>

<Seo
	title={home.seo?.title}
	description={home.seo?.description}
	image={home.seo?.image}
	schema={[organizationLd(data.settings, origin)]}
/>

<HeroCard slides={home.heroSlides} />

<BrandStrip brands={home.brands} />

{#if home.categories.length}
	<section class="pt-6 pb-16 md:pb-24" aria-labelledby="categories">
		<div class="shell">
			<SectionHeading
				id="categories"
				title={home.categoriesHeading ?? 'What we supply'}
				intro={home.categoriesIntro}
			>
				{#snippet action()}
					<Button href="/products" variant="secondary">Browse the catalogue</Button>
				{/snippet}
			</SectionHeading>
		</div>
		{#if useReel}
			<div class="mt-6 overflow-hidden md:mt-10">
				<CircularGallery
					items={reelItems}
					label="Product categories"
					openLabel="Open this category"
					hint="Drag or swipe sideways. Click a category to see its products."
					onactivate={(i) => goto(`/products?category=${reelCategories[i].slug}`)}
				/>
			</div>
		{:else}
			<div class="shell mt-10 md:mt-14">
				<CategoryIndex categories={home.categories} />
			</div>
		{/if}
	</section>
{/if}

{#if featured.length}
	<section class="featured py-16 md:py-24" aria-labelledby="featured">
		<div class="shell">
			<SectionHeading
				id="featured"
				title={home.featuredHeading ?? 'Featured products'}
				intro={home.featuredIntro}
			>
				{#snippet action()}
					<Button href="/products" variant="secondary">View all products</Button>
				{/snippet}
			</SectionHeading>
			<div class="mt-10 md:mt-14">
				<ProductGrid products={featured} />
			</div>
		</div>
	</section>
{/if}

{#if home.offers.length}
	<section class="shell py-16 md:py-24" aria-labelledby="offers">
		<SectionHeading id="offers" title="Current offers" />
		<div class="mt-10">
			<Offers offers={home.offers} />
		</div>
	</section>
{/if}

{#if home.contactPrompt}
	<ContactPrompt
		heading={home.contactPrompt.heading}
		text={home.contactPrompt.text}
		cta={home.contactPrompt.cta}
		settings={data.settings}
	/>
{/if}

<style>
	.featured {
		background: var(--color-stock);
		border-block: 1px solid var(--color-line);
	}
</style>
