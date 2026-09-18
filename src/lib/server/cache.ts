/**
 * CDN caching for CMS-driven pages: browsers always revalidate, the edge keeps
 * a copy for 5 minutes and may serve it stale for a day while refreshing.
 * Content edits in Sanity therefore appear within ~5 minutes.
 */
export const CMS_CACHE = {
	'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
};
