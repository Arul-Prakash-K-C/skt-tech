import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const origin = env.PUBLIC_SITE_URL || url.origin;
	// Set PUBLIC_ALLOW_INDEXING=false on preview/staging deployments.
	const allow = env.PUBLIC_ALLOW_INDEXING !== 'false';

	const body = allow
		? `User-agent: *\nAllow: /\nDisallow: /contact?\n\nSitemap: ${origin}/sitemap.xml\n`
		: 'User-agent: *\nDisallow: /\n';

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
