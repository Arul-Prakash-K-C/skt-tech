import { getEvents } from '$lib/server/content';
import { CMS_CACHE } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(CMS_CACHE);
	return await getEvents();
};
