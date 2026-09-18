<script lang="ts">
	import type { Img } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';

	interface Props {
		name: string;
		logo?: Img;
		/** Visual height of the mark in px. */
		height?: number;
	}

	let { name, logo, height = 32 }: Props = $props();
</script>

{#if logo?.url}
	<SanityImage
		image={logo}
		width={height * 4}
		alt={name}
		sizes="{height * 4}px"
		class="w-auto object-contain"
		style="height: {height}px"
	/>
{:else}
	<!-- Wordmark fallback until the brand's logo is uploaded in Sanity -->
	<span
		class="wordmark"
		style:font-size="{Math.round(height * 0.62)}px"
		style:line-height="{height}px">{name}</span
	>
{/if}

<style>
	.wordmark {
		display: inline-block;
		font-variation-settings: 'wdth' 125;
		font-weight: 720;
		letter-spacing: -0.01em;
		color: currentColor;
		white-space: nowrap;
	}
</style>
