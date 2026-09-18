import type { Availability, ProductCard } from '$lib/sanity/types';

const TZ = 'Asia/Kolkata';

const inr = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0
});

export const formatINR = (n: number) => inr.format(n);

export interface Pricing {
	mrp: number;
	price: number;
	discount: number;
	saving: number;
}

/** Selling price from MRP and discount %. Null when the product is "price on request". */
export function pricing(p: Pick<ProductCard, 'mrp' | 'discount'>): Pricing | null {
	if (!p.mrp || p.mrp <= 0) return null;
	const discount = Math.min(Math.max(p.discount ?? 0, 0), 90);
	const price = Math.round(p.mrp * (1 - discount / 100));
	return { mrp: p.mrp, price, discount, saving: p.mrp - price };
}

export const AVAILABILITY: Record<Availability, { label: string; tone: 'ok' | 'warn' | 'muted' }> =
	{
		'in-stock': { label: 'In stock', tone: 'ok' },
		'on-order': { label: 'Made to order', tone: 'warn' },
		'out-of-stock': { label: 'Out of stock', tone: 'muted' }
	};

const dateFmt = new Intl.DateTimeFormat('en-IN', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: TZ
});
const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: TZ });
const dayOnly = new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: TZ });
const monthShort = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: TZ });
const time = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: TZ });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatTime = (iso: string) => time.format(new Date(iso));

/** Calendar-leaf parts for event date blocks. */
export function dateParts(iso: string) {
	const d = new Date(iso);
	return { day: dayOnly.format(d), month: monthShort.format(d) };
}

const ymd = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });

/** "17 October 2026", "20 – 22 November 2026", "30 October – 2 November 2026". */
export function formatDateRange(startIso: string, endIso?: string) {
	const start = new Date(startIso);
	if (!endIso) return dateFmt.format(start);
	const end = new Date(endIso);
	if (ymd(start) === ymd(end)) return dateFmt.format(start);
	const sameMonth = ymd(start).slice(0, 7) === ymd(end).slice(0, 7);
	return sameMonth
		? `${dayOnly.format(start)} – ${dateFmt.format(end)}`
		: `${dayMonth.format(start)} – ${dateFmt.format(end)}`;
}

export function formatBytes(bytes?: number) {
	if (!bytes) return '';
	const units = ['B', 'KB', 'MB', 'GB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

/** Digits-only phone for tel: and wa.me links. */
export const phoneHref = (phone: string) => phone.replace(/[^\d+]/g, '');
