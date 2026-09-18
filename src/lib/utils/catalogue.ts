import type { ProductCard } from '$lib/sanity/types';
import { pricing } from './format';

export const SORTS = [
	{ value: 'featured', label: 'Recommended' },
	{ value: 'name', label: 'Name, A to Z' },
	{ value: 'price-asc', label: 'Price, low to high' },
	{ value: 'price-desc', label: 'Price, high to low' }
] as const;

export type Sort = (typeof SORTS)[number]['value'];

export interface Filters {
	q: string;
	category: string;
	brand: string;
	inStock: boolean;
	sort: Sort;
}

export function readFilters(params: URLSearchParams): Filters {
	const sort = params.get('sort') as Sort;
	return {
		q: (params.get('q') ?? '').trim().slice(0, 80),
		category: params.get('category') ?? '',
		brand: params.get('brand') ?? '',
		inStock: params.get('stock') === '1',
		sort: SORTS.some((s) => s.value === sort) ? sort : 'featured'
	};
}

export function writeFilters(f: Partial<Filters>): string {
	const p = new URLSearchParams();
	if (f.q) p.set('q', f.q);
	if (f.category) p.set('category', f.category);
	if (f.brand) p.set('brand', f.brand);
	if (f.inStock) p.set('stock', '1');
	if (f.sort && f.sort !== 'featured') p.set('sort', f.sort);
	const s = p.toString();
	return s ? `?${s}` : '';
}

const haystack = (p: ProductCard) =>
	[p.name, p.model, p.brand?.name, p.category?.title, p.shortDescription]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

function matches(p: ProductCard, f: Filters, ignore?: 'category' | 'brand') {
	if (ignore !== 'category' && f.category && p.category?.slug !== f.category) return false;
	if (ignore !== 'brand' && f.brand && p.brand?.slug !== f.brand) return false;
	if (f.inStock && p.availability !== 'in-stock') return false;
	if (f.q) {
		const text = haystack(p);
		return f.q
			.toLowerCase()
			.split(/\s+/)
			.every((token) => text.includes(token));
	}
	return true;
}

const priceOf = (p: ProductCard) => pricing(p)?.price ?? Number.POSITIVE_INFINITY;

export function applyFilters(products: ProductCard[], f: Filters): ProductCard[] {
	const list = products.filter((p) => matches(p, f));
	switch (f.sort) {
		case 'name':
			return list.sort((a, b) => a.name.localeCompare(b.name));
		case 'price-asc':
			return list.sort((a, b) => priceOf(a) - priceOf(b));
		case 'price-desc':
			return list.sort((a, b) => {
				const pa = pricing(a)?.price ?? -1;
				const pb = pricing(b)?.price ?? -1;
				return pb - pa;
			});
		default:
			// Stable: featured first, then CMS display order
			return list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
	}
}

/** Facet counts that respect every other active filter. */
export function facetCounts(products: ProductCard[], f: Filters) {
	const category = new Map<string, number>();
	const brand = new Map<string, number>();
	for (const p of products) {
		if (p.category && matches(p, f, 'category'))
			category.set(p.category.slug, (category.get(p.category.slug) ?? 0) + 1);
		if (p.brand && matches(p, f, 'brand'))
			brand.set(p.brand.slug, (brand.get(p.brand.slug) ?? 0) + 1);
	}
	return {
		category,
		brand,
		allCategories: products.filter((p) => matches(p, f, 'category')).length,
		allBrands: products.filter((p) => matches(p, f, 'brand')).length
	};
}
