import { cta, seo, richText, titledText } from './objects/shared';
import { siteSettings, homePage, aboutPage } from './documents/singletons';
import { category, brand, product } from './documents/catalogue';
import { galleryItem, event } from './documents/media';

export const schemaTypes = [
	// objects
	cta,
	seo,
	richText,
	titledText,
	// singletons
	siteSettings,
	homePage,
	aboutPage,
	// content
	category,
	brand,
	product,
	galleryItem,
	event
];
