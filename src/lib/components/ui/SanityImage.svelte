<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import type { Img } from '$lib/sanity/types';
	import { imageRatio, imageSrcset, imageUrl } from '$lib/sanity/image';

	interface Props extends Omit<HTMLImgAttributes, 'src' | 'srcset' | 'alt' | 'width' | 'height'> {
		image: Img | undefined;
		/** Rendered width in CSS px at the largest layout (used for `src`). */
		width?: number;
		/** Crop to this width ÷ height ratio around the hotspot. */
		aspect?: number;
		sizes?: string;
		alt?: string;
		priority?: boolean;
	}

	let {
		image,
		width = 800,
		aspect,
		sizes = '100vw',
		alt,
		priority = false,
		class: className = '',
		...rest
	}: Props = $props();

	const ratio = $derived(aspect ?? imageRatio(image));
	const src = $derived(imageUrl(image, { width: width * 1.5, aspect }));
	const srcset = $derived(imageSrcset(image, { aspect }));
</script>

{#if image?.url}
	<img
		{src}
		{srcset}
		sizes={srcset ? sizes : undefined}
		alt={alt ?? image.alt ?? ''}
		width={Math.round(width)}
		height={Math.round(width / ratio)}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : undefined}
		decoding={priority ? 'sync' : 'async'}
		class={className}
		style:background-image={image.lqip ? `url(${image.lqip})` : undefined}
		style:background-size="cover"
		{...rest}
	/>
{/if}
