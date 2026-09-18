import { env } from '$env/dynamic/public';
import { getSitemapEntries } from '$lib/server/content';
import type { RequestHandler } from './$types';

const xmlEscape = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: RequestHandler = async ({ url }) => {
	const origin = env.PUBLIC_SITE_URL || url.origin;
	const entries = await getSitemapEntries();

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) =>
			`  <url><loc>${xmlEscape(new URL(e.href, origin).toString())}</loc>${e.updatedAt ? `<lastmod>${e.updatedAt.slice(0, 10)}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=0, s-maxage=3600'
		}
	});
};
