<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import type { Img } from '$lib/sanity/types';
	import { imageUrl } from '$lib/sanity/image';
	import { absolute, jsonLd } from '$lib/utils/seo';

	interface Props {
		title?: string;
		description?: string;
		image?: Img;
		type?: 'website' | 'product' | 'article';
		noIndex?: boolean;
		/** Structured data objects rendered as JSON-LD. */
		schema?: object[];
	}

	let {
		title,
		description,
		image,
		type = 'website',
		noIndex = false,
		schema = []
	}: Props = $props();

	const settings = $derived(page.data.settings);
	const siteName = $derived(settings?.companyName ?? 'SKT Technologies');
	const origin = $derived(env.PUBLIC_SITE_URL || page.url.origin);
	const fullTitle = $derived(
		title ? `${title} | ${siteName}` : `${siteName} — ${settings?.tagline ?? ''}`
	);
	const desc = $derived(
		description ?? settings?.defaultSeo?.description ?? settings?.description ?? ''
	);
	const canonical = $derived(absolute(origin, page.url.pathname));
	const ogImage = $derived.by(() => {
		const img = image ?? settings?.defaultSeo?.image;
		return img ? absolute(origin, imageUrl(img, { width: 1200, aspect: 1200 / 630 })) : undefined;
	});
</script>

<svelte:head>
	<title>{fullTitle}</title>
	{#if desc}<meta name="description" content={desc} />{/if}
	<link rel="canonical" href={canonical} />
	{#if noIndex}<meta name="robots" content="noindex, nofollow" />{/if}

	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content={type === 'product' ? 'product' : type} />
	<meta property="og:title" content={title ?? fullTitle} />
	{#if desc}<meta property="og:description" content={desc} />{/if}
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content="en_IN" />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}

	{#each schema as item, i (i)}
		{@html jsonLd(item)}
	{/each}
</svelte:head>
