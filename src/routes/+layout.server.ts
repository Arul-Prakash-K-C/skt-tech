import { getNavCategories, getSettings } from '$lib/server/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const [settings, navCategories] = await Promise.all([getSettings(), getNavCategories()]);
	return { settings, navCategories };
};
