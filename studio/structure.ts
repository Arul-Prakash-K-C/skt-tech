import type { StructureResolver } from 'sanity/structure';
import { CogIcon } from '@sanity/icons/Cog';
import { HomeIcon } from '@sanity/icons/Home';
import { UsersIcon } from '@sanity/icons/Users';

/** Singleton document types — each has exactly one document with id === type. */
export const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage'];

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string, icon: typeof CogIcon) =>
	S.listItem()
		.title(title)
		.icon(icon)
		.child(S.document().schemaType(type).documentId(type).title(title));

export const structure: StructureResolver = (S) =>
	S.list()
		.title('Content')
		.items([
			singleton(S, 'homePage', 'Home page', HomeIcon),
			singleton(S, 'aboutPage', 'About page', UsersIcon),
			singleton(S, 'siteSettings', 'Company & site settings', CogIcon),
			S.divider(),
			S.documentTypeListItem('product').title('Products'),
			S.documentTypeListItem('category').title('Product categories'),
			S.documentTypeListItem('brand').title('Brands'),
			S.divider(),
			S.documentTypeListItem('galleryItem').title('Gallery'),
			S.documentTypeListItem('event').title('Events')
		]);
