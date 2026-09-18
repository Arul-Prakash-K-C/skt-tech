import { getCatalogue } from '$lib/server/content';
import { CMS_CACHE } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

// The whole catalogue is loaded once and filtered in the component from the
// URL. This load deliberately never reads `url.searchParams`, so changing a
// filter is instant and never refetches from Sanity.
export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(CMS_CACHE);
	return { catalogue: await getCatalogue() };
};
