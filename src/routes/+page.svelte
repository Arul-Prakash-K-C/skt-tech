<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import Seo from '$lib/components/ui/Seo.svelte';
	import HeroPrint from '$lib/components/hero/HeroPrint.svelte';
	import BrandStrip from '$lib/components/brands/BrandStrip.svelte';
	import SectionHeading from '$lib/components/sections/SectionHeading.svelte';
	import CategoryIndex from '$lib/components/sections/CategoryIndex.svelte';
	import ProductGrid from '$lib/components/products/ProductGrid.svelte';
	import Offers from '$lib/components/sections/Offers.svelte';
	import EventRow from '$lib/components/events/EventRow.svelte';
	import ContactPrompt from '$lib/components/sections/ContactPrompt.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { organizationLd } from '$lib/utils/seo';

	let { data } = $props();

	const home = $derived(data.home);
	const origin = $derived(env.PUBLIC_SITE_URL || page.url.origin);
</script>

<Seo
	title={home.seo?.title}
	description={home.seo?.description}
	image={home.seo?.image}
	schema={[organizationLd(data.settings, origin)]}
/>

<HeroPrint slides={home.heroSlides} />

<BrandStrip brands={home.brands} />

{#if home.categories.length}
	<section class="shell py-16 md:py-24" aria-labelledby="categories">
		<SectionHeading
			id="categories"
			title={home.categoriesHeading ?? 'What we supply'}
			intro={home.categoriesIntro}
		/>
		<div class="mt-10 md:mt-14">
			<CategoryIndex categories={home.categories} />
		</div>
	</section>
{/if}

{#if home.featuredProducts.length}
	<section class="border-t border-line bg-stock/60 py-16 md:py-24" aria-labelledby="featured">
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
				<ProductGrid products={home.featuredProducts} />
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

{#if home.upcomingEvents.length}
	<section class="border-t border-line py-16 md:py-24" aria-labelledby="events">
		<div class="shell">
			<SectionHeading
				id="events"
				title="Where to see us next"
				intro="Demo days and trade shows where you can try printers with your own card designs."
			>
				{#snippet action()}
					<Button href="/events" variant="secondary">All events</Button>
				{/snippet}
			</SectionHeading>
			<div class="mt-8 divide-y divide-line border-y border-line">
				{#each home.upcomingEvents as event (event._id)}
					<EventRow {event} />
				{/each}
			</div>
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
