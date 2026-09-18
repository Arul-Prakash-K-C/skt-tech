import type { EventDetail, ProductDetail, SiteSettings } from '$lib/sanity/types';
import { imageUrl } from '$lib/sanity/image';
import { pricing } from './format';

export const absolute = (origin: string, path = '/') => new URL(path, origin).toString();

/** Serialise JSON-LD for an inline script, escaping `<` so content can't close the tag. */
export const jsonLd = (data: unknown) =>
	`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export function organizationLd(s: SiteSettings, origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'@id': absolute(origin, '/#organization'),
		name: s.companyName,
		legalName: s.legalName,
		description: s.description,
		url: absolute(origin, '/'),
		telephone: s.phone,
		email: s.email,
		address: s.address
			? { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'IN' }
			: undefined,
		taxID: s.gstin,
		sameAs: s.social?.map((l) => l.url)
	};
}

export function productLd(p: ProductDetail, origin: string) {
	const price = pricing(p);
	const availability = {
		'in-stock': 'https://schema.org/InStock',
		'on-order': 'https://schema.org/PreOrder',
		'out-of-stock': 'https://schema.org/OutOfStock'
	}[p.availability];
	const url = absolute(origin, `/products/${p.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: p.name,
		sku: p.model,
		description: p.seo?.description ?? p.shortDescription,
		image: p.images.map((i) => absolute(origin, imageUrl(i, { width: 1200 }))),
		brand: p.brand ? { '@type': 'Brand', name: p.brand.name } : undefined,
		category: p.category?.title,
		url,
		offers: price
			? {
					'@type': 'Offer',
					priceCurrency: 'INR',
					price: price.price,
					availability,
					url,
					seller: { '@id': absolute(origin, '/#organization') }
				}
			: undefined
	};
}

export function eventLd(e: EventDetail, origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: e.title,
		startDate: e.startDate,
		endDate: e.endDate,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: e.location ? { '@type': 'Place', name: e.location, address: e.location } : undefined,
		image: e.coverImage ? [absolute(origin, imageUrl(e.coverImage, { width: 1200 }))] : undefined,
		description: e.summary,
		organizer: { '@id': absolute(origin, '/#organization') },
		url: absolute(origin, `/events/${e.slug}`)
	};
}

export function breadcrumbLd(origin: string, items: { name: string; href: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((it, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: it.name,
			item: absolute(origin, it.href)
		}))
	};
}
