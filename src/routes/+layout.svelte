<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import fontUrl from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2?url';
	import { onNavigate } from '$app/navigation';
	import Header from '$lib/components/navigation/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';

	let { children, data } = $props();

	// Cross-document feel on client navigations. Filter/query changes on the
	// same page are left alone so the product grid doesn't flash.
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion()) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="preload" href={fontUrl} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<Header settings={data.settings} categories={data.navCategories} />
	<main id="main" tabindex="-1" class="flex-1 outline-none [view-transition-name:main]">
		{@render children()}
	</main>
	<Footer settings={data.settings} categories={data.navCategories} />
</div>
