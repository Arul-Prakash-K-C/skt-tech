import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityConfig } from './config';
import type { Img } from './types';

const builder = createImageUrlBuilder({
	projectId: sanityConfig.projectId || 'placeholder',
	dataset: sanityConfig.dataset
});

export const IMAGE_WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 2000] as const;

interface UrlOptions {
	width: number;
	/** Width ÷ height. When set, the image is cropped around the editor's hotspot. */
	aspect?: number;
	quality?: number;
}

/** Build a CDN URL for a Sanity image, or pass a static fallback URL through unchanged. */
export function imageUrl(image: Img | undefined, { width, aspect, quality = 78 }: UrlOptions) {
	if (!image) return '';
	if (!image.ref) return image.url;

	let b = builder
		.image({
			asset: { _ref: image.ref },
			hotspot: image.hotspot ?? undefined,
			crop: image.crop ?? undefined
		})
		.width(Math.round(width))
		.quality(quality)
		.auto('format');
	if (aspect) b = b.height(Math.round(width / aspect)).fit('crop');
	return b.url();
}

/** `srcset` for responsive Sanity images; empty for static (vector) fallbacks. */
export function imageSrcset(
	image: Img | undefined,
	opts: Omit<UrlOptions, 'width'> & { max?: number }
) {
	if (!image?.ref) return undefined;
	const max = opts.max ?? image.width ?? 2000;
	return IMAGE_WIDTHS.filter((w) => w <= max)
		.map((w) => `${imageUrl(image, { ...opts, width: w })} ${w}w`)
		.join(', ');
}

/** Intrinsic ratio used for width/height attributes so the layout never shifts. */
export function imageRatio(image: Img | undefined, fallback = 1.5) {
	if (image?.width && image?.height) return image.width / image.height;
	return fallback;
}

/**
 * URL for using an image as a WebGL texture. Sanity images go through the
 * site's own `/api/image` route, so the browser never needs the CDN's CORS
 * permission; static images are already same-origin.
 */
export function textureUrl(image: Img | undefined, opts: UrlOptions) {
	const url = imageUrl(image, opts);
	return url.startsWith('https://cdn.sanity.io/')
		? `/api/image?src=${encodeURIComponent(url)}`
		: url;
}
