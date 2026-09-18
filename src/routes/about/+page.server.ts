import { error } from '@sveltejs/kit';
import { getAbout } from '$lib/server/content';
import { CMS_CACHE } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const about = await getAbout();
	if (!about) error(404, 'About page has not been published yet');
	setHeaders(CMS_CACHE);
	return { about };
};
