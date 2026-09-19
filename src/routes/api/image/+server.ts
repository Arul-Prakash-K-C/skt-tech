import { error } from '@sveltejs/kit';
import { sanityConfig } from '$lib/sanity/config';
import type { RequestHandler } from './$types';

/**
 * Same-origin pass-through for Sanity CDN images used as WebGL textures.
 *
 * WebGL may only use cross-origin images the server allows via CORS, and
 * Sanity allows only the origins listed in the project's CORS settings. That
 * breaks the reels on any other address (a phone on the LAN, preview
 * deployments, a new domain). Serving the bytes from our own origin removes
 * the dependency entirely.
 *
 * Only images from this project's dataset are forwarded, so this can't be
 * used as an open proxy. Sanity image URLs are immutable, so responses cache
 * for a year at the browser and the edge.
 */
export const GET: RequestHandler = async ({ url, request, fetch }) => {
	const src = url.searchParams.get('src') ?? '';
	let target: URL;
	try {
		target = new URL(src);
	} catch {
		error(400, 'Invalid image URL');
	}

	const prefix = `/images/${sanityConfig.projectId}/${sanityConfig.dataset}/`;
	if (
		target.protocol !== 'https:' ||
		target.hostname !== 'cdn.sanity.io' ||
		!target.pathname.startsWith(prefix) ||
		target.username ||
		target.password
	) {
		error(400, 'Only images from this site’s Sanity project can be loaded');
	}

	const upstream = await fetch(target, {
		// Pass Accept through so auto=format still negotiates WebP/AVIF
		headers: { accept: request.headers.get('accept') ?? 'image/*' },
		signal: AbortSignal.timeout(10_000)
	}).catch(() => null);

	if (!upstream?.ok || !upstream.body)
		error(upstream?.status === 404 ? 404 : 502, 'Image unavailable');

	const type = upstream.headers.get('content-type') ?? '';
	if (!type.startsWith('image/')) error(502, 'Unexpected response from the image CDN');

	return new Response(upstream.body, {
		headers: {
			'content-type': type,
			'cache-control': 'public, max-age=31536000, immutable',
			vary: 'Accept',
			'x-content-type-options': 'nosniff',
			// SVGs can carry script; if someone opens this URL directly, run nothing
			'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
		}
	});
};
