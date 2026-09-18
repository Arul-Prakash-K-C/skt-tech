<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Something went wrong'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="shell grid min-h-[60vh] place-items-center py-20">
	<div class="max-w-lg text-center">
		<!-- A misfed card: rotated and off the output tray -->
		<svg
			class="mx-auto mb-8 text-line-strong"
			width="120"
			height="90"
			viewBox="0 0 120 90"
			aria-hidden="true"
		>
			<line x1="4" y1="80" x2="116" y2="80" stroke="currentColor" stroke-width="2" />
			<g transform="rotate(-14 60 45)">
				<rect
					x="22"
					y="18"
					width="76"
					height="48"
					rx="6"
					fill="white"
					stroke="currentColor"
					stroke-width="2"
				/>
				<rect x="30" y="28" width="16" height="20" rx="2" fill="currentColor" opacity=".5" />
				<rect x="52" y="30" width="36" height="5" rx="2.5" fill="currentColor" />
			</g>
		</svg>
		<p class="meta num">Error {page.status}</p>
		<h1 class="h2 mt-2">
			{notFound ? 'This page isn’t in the tray' : 'Something went wrong on our side'}
		</h1>
		<p class="mt-4 text-muted">
			{notFound
				? 'The link may be old or the product may have moved. Try the catalogue, or ask us directly.'
				: 'Please try again in a moment. If it keeps happening, call or email us and we’ll help.'}
		</p>
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<Button href="/products">Browse products</Button>
			<Button href="/contact" variant="secondary">Contact us</Button>
		</div>
	</div>
</section>
