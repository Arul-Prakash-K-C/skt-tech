<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import fontUrl from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2?url';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
	import 'lenis/dist/lenis.css';
	import Header from '$lib/components/navigation/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import {
		pauseSmoothScroll,
		resumeSmoothScroll,
		startSmoothScroll
	} from '$lib/utils/smooth-scroll';

	let { children, data } = $props();

	// Smooth wheel scrolling everywhere. It holds still during navigation, so
	// SvelteKit's own scroll handling (top of the new page, back/forward
	// restoration, #hash links) always wins, then picks up from there.
	onMount(startSmoothScroll);
	beforeNavigate(({ willUnload }) => {
		if (!willUnload) pauseSmoothScroll();
	});
	afterNavigate(({ type }) => {
		if (type !== 'enter') resumeSmoothScroll();
	});

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
