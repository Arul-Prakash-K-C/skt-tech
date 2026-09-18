/**
 * Sample content, served only while no Sanity project is configured
 * (PUBLIC_SANITY_PROJECT_ID empty). It mirrors the GROQ projection shapes
 * exactly, so every page renders the same way it will with live CMS data.
 * `studio/seed` imports this same content into Sanity.
 *
 * Replace all of it in Sanity Studio before launch.
 */

import type {
	AboutPage,
	Brand,
	Category,
	EventDetail,
	GalleryItem,
	Img,
	PortableTextBlock,
	ProductDetail,
	SiteSettings
} from '$lib/sanity/types';

const img = (name: string, alt: string, width = 800, height = 600): Img => ({
	url: `/samples/${name}.svg`,
	alt,
	width,
	height
});

let keySeq = 0;
const key = () => `k${(keySeq++).toString(36)}`;

/** Minimal Portable Text builder for sample copy. */
function pt(...paragraphs: (string | { h2: string } | { list: string[] })[]): PortableTextBlock[] {
	return paragraphs.flatMap((p): PortableTextBlock[] => {
		if (typeof p === 'string') {
			return [
				{
					_type: 'block',
					_key: key(),
					style: 'normal',
					markDefs: [],
					children: [{ _type: 'span', _key: key(), text: p, marks: [] }]
				}
			];
		}
		if ('h2' in p) {
			return [
				{
					_type: 'block',
					_key: key(),
					style: 'h2',
					markDefs: [],
					children: [{ _type: 'span', _key: key(), text: p.h2, marks: [] }]
				}
			];
		}
		return p.list.map((text) => ({
			_type: 'block',
			_key: key(),
			style: 'normal',
			listItem: 'bullet',
			level: 1,
			markDefs: [],
			children: [{ _type: 'span', _key: key(), text, marks: [] }]
		}));
	});
}

const rows = (pairs: [string, string][]) =>
	pairs.map(([label, value]) => ({ _key: key(), label, value }));
const group = (title: string, pairs: [string, string][]) => ({
	_key: key(),
	title,
	rows: rows(pairs)
});

// ---------------------------------------------------------------------------

export const settings: SiteSettings = {
	companyName: 'SKT Technologies',
	legalName: 'SKT Technologies',
	tagline: 'ID card printers, cards and consumables for Indian institutions',
	description:
		'SKT Technologies supplies ID card printers, ribbons, PVC, RFID and NFC cards, lanyards and accessories to colleges, schools, offices and factories across Tamil Nadu, with installation and service from Chennai.',
	phone: '+91 44 0000 0000',
	whatsapp: '+91 44 0000 0000',
	email: 'enquiry@example.com',
	address: 'Velachery, Chennai, Tamil Nadu, India',
	mapUrl: 'https://maps.google.com/?q=Velachery,Chennai',
	hours: 'Monday to Saturday, 9:30 am – 6:30 pm',
	gstin: '33HHVPS7848D1ZI',
	social: [],
	footerNote:
		'Authorised reseller pricing. All prices are MRP in Indian rupees, GST extra unless stated.'
};

export const categories: Category[] = [
	{
		_id: 'cat-printers',
		title: 'ID card printers',
		slug: 'id-card-printers',
		description: 'Direct-to-card and retransfer printers for single and dual-sided ID cards.',
		image: img('printer-evolis', 'ID card printer')
	},
	{
		_id: 'cat-ribbons',
		title: 'Printer ribbons',
		slug: 'printer-ribbons',
		description: 'Genuine YMCKO colour and monochrome ribbons matched to each printer.',
		image: img('ribbon-evolis', 'Colour ribbon cartridge')
	},
	{
		_id: 'cat-cards',
		title: 'PVC, RFID & NFC cards',
		slug: 'cards',
		description: 'Blank CR80 cards, proximity and smart cards, printed in-house or by you.',
		image: img('cards-pvc', 'Stack of blank PVC cards')
	},
	{
		_id: 'cat-lanyards',
		title: 'Lanyards & holders',
		slug: 'lanyards-holders',
		description: 'Printed lanyards, badge reels and rigid card holders in your colours.',
		image: img('lanyard', 'Printed lanyard with ID card')
	},
	{
		_id: 'cat-barcode',
		title: 'Barcode & label printers',
		slug: 'barcode-label-printers',
		description: 'Desktop thermal printers for labels, tags and asset tracking.',
		image: img('barcode-tsc', 'Barcode label printer')
	}
];

const cat = (slug: string) => {
	const c = categories.find((c) => c.slug === slug)!;
	return { title: c.title, slug: c.slug };
};

export const brands: Brand[] = [
	{
		_id: 'brand-evolis',
		name: 'Evolis',
		slug: 'evolis',
		description:
			'French manufacturer of card personalisation printers, known for compact desktop models that suit school and office ID programmes.',
		website: 'https://www.evolis.com',
		categories: [cat('id-card-printers'), cat('printer-ribbons')]
	},
	{
		_id: 'brand-zebra',
		name: 'Zebra',
		slug: 'zebra',
		description:
			'Card and barcode printing systems built for high uptime, with a wide ribbon and label media range.',
		website: 'https://www.zebra.com',
		categories: [cat('id-card-printers'), cat('printer-ribbons'), cat('barcode-label-printers')]
	},
	{
		_id: 'brand-magicard',
		name: 'Magicard',
		slug: 'magicard',
		description:
			'UK-designed card printers with built-in visual security watermarking for tamper-evident IDs.',
		website: 'https://magicard.com',
		categories: [cat('id-card-printers'), cat('printer-ribbons')]
	},
	{
		_id: 'brand-hid',
		name: 'HID Fargo',
		slug: 'hid-fargo',
		description:
			'Secure credential printers and encoders used across access-control and government ID programmes.',
		website: 'https://www.hidglobal.com',
		categories: [cat('id-card-printers')]
	},
	{
		_id: 'brand-tsc',
		name: 'TSC',
		slug: 'tsc',
		description:
			'Reliable thermal barcode printers for retail, warehouse and manufacturing labels.',
		website: 'https://www.tscprinters.com',
		categories: [cat('barcode-label-printers')]
	}
];

const brand = (slug: string) => {
	const b = brands.find((b) => b.slug === slug)!;
	return { name: b.name, slug: b.slug };
};

type Draft = Omit<ProductDetail, 'related' | 'comparison'> & {
	relatedSlugs?: string[];
	compare?: { intro?: string; attributes: string[]; slugs: string[] };
};

const printerSpecs = (
	resolution: string,
	speed: string,
	sides: string,
	hopper: string,
	connectivity: string,
	encoding: string,
	warranty: string
) => [
	group('Printing', [
		['Print technology', 'Dye sublimation / resin thermal transfer'],
		['Resolution', resolution],
		['Colour print speed', speed],
		['Printing sides', sides]
	]),
	group('Card handling', [
		['Card size', 'CR80 (85.6 × 54 mm)'],
		['Card thickness', '0.25 – 1.0 mm'],
		['Input hopper', hopper]
	]),
	group('Connectivity & options', [
		['Interfaces', connectivity],
		['Encoding options', encoding],
		['Warranty', warranty]
	])
];

const drafts: Draft[] = [
	{
		_id: 'p-primacy2',
		name: 'Evolis Primacy 2',
		slug: 'evolis-primacy-2',
		model: 'PM2-0001',
		shortDescription: 'Fast, quiet dual-sided desktop printer for medium-volume ID programmes.',
		images: [
			img('printer-evolis', 'Evolis Primacy 2 card printer'),
			img('face-employee', 'Sample employee ID printed on Primacy 2', 1016, 640),
			img('scene-desk', 'Primacy 2 at a reception desk', 1200, 800)
		],
		mrp: 145000,
		discount: 8,
		availability: 'in-stock',
		featured: true,
		category: cat('id-card-printers'),
		brand: brand('evolis'),
		overview: pt(
			'Primacy 2 prints edge-to-edge colour ID cards in a single pass and flips them automatically for the reverse. It is the printer we recommend most often to colleges and offices issuing a few hundred to a few thousand cards a year.',
			'The hopper, ribbon and cleaning roller are all reachable from the front, so a new operator can reload it without a manual. We install, configure and train your staff on site.'
		),
		features: [
			'Dual-sided printing with an automatic card flipper',
			'Edge-to-edge printing on standard CR80 cards',
			'100-card input hopper and a front-loading design',
			'USB and Ethernet as standard',
			'Upgradeable to magnetic stripe or contactless encoding'
		],
		specGroups: printerSpecs(
			'300 dpi',
			'Up to 225 cards/hour (single-sided)',
			'Single or dual-sided',
			'100 cards (0.76 mm)',
			'USB 2.0, Ethernet',
			'Magnetic stripe, contact and contactless (optional)',
			'3 years'
		),
		documents: [],
		compare: {
			intro: 'How Primacy 2 compares with other desktop printers we stock.',
			attributes: [
				'Resolution',
				'Colour print speed',
				'Printing sides',
				'Input hopper',
				'Interfaces',
				'Warranty'
			],
			slugs: ['zebra-zc300', 'magicard-300']
		},
		relatedSlugs: ['evolis-ymcko-ribbon', 'pvc-cards-cr80-076', 'printed-lanyards-20mm']
	},
	{
		_id: 'p-zc300',
		name: 'Zebra ZC300',
		slug: 'zebra-zc300',
		model: 'ZC31-0000000',
		shortDescription:
			'Slim, simple card printer with an intuitive ribbon cartridge and colour display.',
		images: [
			img('printer-zebra', 'Zebra ZC300 card printer'),
			img('face-access', 'Sample access card printed on ZC300', 1016, 640)
		],
		mrp: 132000,
		discount: 5,
		availability: 'in-stock',
		featured: true,
		category: cat('id-card-printers'),
		brand: brand('zebra'),
		overview: pt(
			'The ZC300 is built around ease of use: drop-in ribbon cartridges, a card output hopper that is visible from the front, and on-screen status for every step.',
			'It suits offices, hospitals and events where different people print badges through the day.'
		),
		features: [
			'Drop-in ribbon cartridge with automatic media detection',
			'Colour LCD with animated guidance',
			'Prints on cards from 0.25 mm to 1 mm thick',
			'Wi-Fi option for shared printing',
			'Encoding upgrades available in the field'
		],
		specGroups: printerSpecs(
			'300 dpi',
			'Up to 200 cards/hour (single-sided)',
			'Single or dual-sided',
			'100 cards (0.76 mm)',
			'USB 2.0, Ethernet, optional Wi-Fi',
			'Magnetic stripe, contact and contactless (optional)',
			'3 years'
		),
		documents: [],
		compare: {
			attributes: ['Resolution', 'Colour print speed', 'Printing sides', 'Interfaces', 'Warranty'],
			slugs: ['evolis-primacy-2', 'magicard-300']
		},
		relatedSlugs: ['zebra-ymcko-ribbon', 'mifare-1k-rfid-cards']
	},
	{
		_id: 'p-magicard300',
		name: 'Magicard 300',
		slug: 'magicard-300',
		model: '3652-5001',
		shortDescription: 'Compact printer with HoloKote® watermarking for tamper-evident cards.',
		images: [
			img('printer-magicard', 'Magicard 300 card printer'),
			img('face-student', 'Sample student ID printed on Magicard 300', 1016, 640)
		],
		mrp: 118000,
		discount: 10,
		availability: 'on-order',
		featured: true,
		category: cat('id-card-printers'),
		brand: brand('magicard'),
		overview: pt(
			'Magicard 300 applies a secure watermark to every card at no extra cost per card, which makes forged or altered IDs easy to spot.',
			'A good fit for universities and government offices that need visible security without laminates.'
		),
		features: [
			'HoloKote® watermarking included',
			'Single-sided, upgradeable to dual-sided',
			'Energy-saving standby mode',
			'Ethernet and USB'
		],
		specGroups: printerSpecs(
			'300 dpi',
			'Up to 180 cards/hour (single-sided)',
			'Single-sided (dual-sided upgrade)',
			'100 cards (0.76 mm)',
			'USB 2.0, Ethernet',
			'Magnetic stripe (optional)',
			'2 years'
		),
		documents: [],
		relatedSlugs: ['magicard-ymcko-ribbon', 'pvc-cards-cr80-076']
	},
	{
		_id: 'p-dtc1500e',
		name: 'HID Fargo DTC1500e',
		slug: 'hid-fargo-dtc1500e',
		model: 'DTC1500e',
		shortDescription: 'Secure direct-to-card printer with optional lamination and encoding.',
		images: [img('printer-fargo', 'HID Fargo DTC1500e card printer')],
		mrp: 168000,
		discount: 0,
		availability: 'on-order',
		featured: false,
		category: cat('id-card-printers'),
		brand: brand('hid-fargo'),
		overview: pt(
			'The DTC1500e is designed for credential programmes where security matters: password-protected printing, secure ribbon and optional lamination.'
		),
		features: [
			'Password-protected printer access',
			'Optional dual-sided lamination module',
			'Contact and contactless encoding modules'
		],
		specGroups: printerSpecs(
			'300 dpi',
			'Up to 225 cards/hour (single-sided)',
			'Single or dual-sided',
			'100 cards (0.76 mm)',
			'USB 2.0, Ethernet',
			'Prox, iCLASS, MIFARE (optional)',
			'3 years'
		),
		documents: []
	},
	{
		_id: 'p-evolis-ribbon',
		name: 'Evolis YMCKO colour ribbon',
		slug: 'evolis-ymcko-ribbon',
		model: 'R5F008',
		shortDescription: 'Genuine full-colour ribbon for Primacy printers — 300 prints per roll.',
		images: [img('ribbon-evolis', 'Evolis YMCKO ribbon cartridge')],
		mrp: 6900,
		discount: 5,
		availability: 'in-stock',
		featured: true,
		category: cat('printer-ribbons'),
		brand: brand('evolis'),
		overview: pt(
			'Five panels per print: yellow, magenta and cyan for the image, black resin for sharp text and barcodes, and a clear overlay that protects the card surface.'
		),
		features: [
			'300 single-sided prints per roll',
			'Clear overlay panel for durability',
			'Cleaning roller included'
		],
		specGroups: [
			group('Ribbon', [
				['Panels', 'YMCKO'],
				['Yield', '300 prints'],
				['Compatible printers', 'Evolis Primacy, Primacy 2']
			])
		],
		documents: []
	},
	{
		_id: 'p-zebra-ribbon',
		name: 'Zebra ZC300 YMCKO ribbon',
		slug: 'zebra-ymcko-ribbon',
		model: '800300-350',
		shortDescription: 'Colour ribbon cartridge for ZC100 and ZC300 printers — 300 prints.',
		images: [img('ribbon-zebra', 'Zebra YMCKO ribbon cartridge')],
		mrp: 7400,
		discount: 0,
		availability: 'in-stock',
		category: cat('printer-ribbons'),
		brand: brand('zebra'),
		overview: pt(
			'Drop-in cartridge with the ribbon and cleaning roller in one piece. The printer reads the ribbon type automatically.'
		),
		features: [
			'300 prints per cartridge',
			'Automatic ribbon detection',
			'Cleaning roller built in'
		],
		specGroups: [
			group('Ribbon', [
				['Panels', 'YMCKO'],
				['Yield', '300 prints'],
				['Compatible printers', 'Zebra ZC100, ZC300']
			])
		],
		documents: []
	},
	{
		_id: 'p-magicard-ribbon',
		name: 'Magicard YMCKO ribbon',
		slug: 'magicard-ymcko-ribbon',
		model: 'MC300YMCKO',
		shortDescription: 'Full-colour ribbon for the Magicard 300 — 300 prints.',
		images: [img('ribbon-magicard', 'Magicard YMCKO ribbon')],
		mrp: 6400,
		discount: 12,
		availability: 'in-stock',
		category: cat('printer-ribbons'),
		brand: brand('magicard'),
		specGroups: [
			group('Ribbon', [
				['Panels', 'YMCKO'],
				['Yield', '300 prints'],
				['Compatible printers', 'Magicard 300']
			])
		],
		documents: []
	},
	{
		_id: 'p-pvc',
		name: 'CR80 PVC cards, 0.76 mm',
		slug: 'pvc-cards-cr80-076',
		model: 'Pack of 500',
		shortDescription: 'Graphic-quality blank white cards for every desktop ID printer.',
		images: [img('cards-pvc', 'Stack of blank white PVC cards')],
		mrp: 3250,
		discount: 0,
		availability: 'in-stock',
		featured: true,
		category: cat('cards'),
		overview: pt(
			'Glossy, dust-free cards with a consistent surface for dye-sublimation printing. Standard 30 mil thickness fits every printer we sell.'
		),
		features: [
			'ISO CR80 size, 0.76 mm (30 mil)',
			'High-gloss finish on both sides',
			'Packed in sealed stacks of 100'
		],
		specGroups: [
			group('Card', [
				['Size', '85.6 × 54 mm (CR80)'],
				['Thickness', '0.76 mm'],
				['Material', 'PVC'],
				['Pack', '500 cards (5 × 100)']
			])
		],
		documents: []
	},
	{
		_id: 'p-mifare',
		name: 'MIFARE Classic 1K RFID cards',
		slug: 'mifare-1k-rfid-cards',
		model: 'Pack of 100',
		shortDescription: 'Printable 13.56 MHz smart cards for access control and attendance.',
		images: [img('card-rfid', 'RFID card with antenna coil')],
		mrp: 5500,
		discount: 6,
		availability: 'in-stock',
		category: cat('cards'),
		overview: pt(
			'The most widely supported contactless card for door access, canteen and attendance systems. Print your design directly on the card surface.'
		),
		specGroups: [
			group('Card', [
				['Chip', 'MIFARE Classic EV1 1K'],
				['Frequency', '13.56 MHz'],
				['Read range', 'Up to 5 cm'],
				['Pack', '100 cards']
			])
		],
		documents: []
	},
	{
		_id: 'p-nfc',
		name: 'NFC NTAG215 cards',
		slug: 'nfc-ntag215-cards',
		model: 'Pack of 50',
		shortDescription: 'Tap-to-share NFC cards for digital business cards and product links.',
		images: [img('card-nfc', 'Dark NFC card')],
		mrp: 4200,
		discount: 0,
		availability: 'on-order',
		category: cat('cards'),
		specGroups: [
			group('Card', [
				['Chip', 'NTAG215 (504 bytes)'],
				['Compatible with', 'Android and iPhone'],
				['Pack', '50 cards']
			])
		],
		documents: []
	},
	{
		_id: 'p-lanyard',
		name: 'Printed polyester lanyards, 20 mm',
		slug: 'printed-lanyards-20mm',
		model: 'Minimum order 100',
		shortDescription: 'Your logo printed edge to edge, with a metal hook and safety breakaway.',
		images: [img('lanyard', 'Printed lanyard with ID card')],
		mrp: 45,
		discount: 0,
		availability: 'on-order',
		featured: true,
		category: cat('lanyards-holders'),
		overview: pt(
			'Dye-sublimated polyester in any Pantone colour. Price shown is per lanyard for orders of 500; send us your artwork for an exact quote.'
		),
		features: [
			'Full-colour sublimation print',
			'Safety breakaway at the neck',
			'Metal J-hook or lobster clip'
		],
		specGroups: [
			group('Lanyard', [
				['Width', '20 mm'],
				['Material', 'Polyester'],
				['Print', 'Sublimation, both sides'],
				['Minimum order', '100 pieces']
			])
		],
		documents: []
	},
	{
		_id: 'p-holder',
		name: 'Rigid vertical card holder',
		slug: 'rigid-vertical-card-holder',
		model: 'Pack of 50',
		shortDescription: 'Clear polycarbonate holder that keeps printed cards flat and scratch-free.',
		images: [img('card-holder', 'Clear rigid ID card holder')],
		mrp: 1750,
		discount: 10,
		availability: 'in-stock',
		category: cat('lanyards-holders'),
		specGroups: [
			group('Holder', [
				['Fits', 'CR80 cards'],
				['Orientation', 'Vertical'],
				['Material', 'Polycarbonate'],
				['Pack', '50 holders']
			])
		],
		documents: []
	},
	{
		_id: 'p-te244',
		name: 'TSC TE244 barcode printer',
		slug: 'tsc-te244',
		model: 'TE244',
		shortDescription: 'Compact 4-inch desktop printer for shipping, retail and asset labels.',
		images: [img('barcode-tsc', 'TSC TE244 barcode printer')],
		mrp: 21500,
		discount: 7,
		availability: 'in-stock',
		featured: true,
		category: cat('barcode-label-printers'),
		brand: brand('tsc'),
		overview: pt(
			'Prints direct thermal and thermal transfer labels up to 108 mm wide. Works with common labelling software and ERP systems.'
		),
		features: [
			'Direct thermal and thermal transfer',
			'Up to 5 inches per second',
			'USB interface, driver for Windows'
		],
		specGroups: [
			group('Printing', [
				['Resolution', '203 dpi'],
				['Max print width', '108 mm'],
				['Speed', '5 ips'],
				['Interfaces', 'USB 2.0']
			])
		],
		documents: []
	},
	{
		_id: 'p-zd230',
		name: 'Zebra ZD230 label printer',
		slug: 'zebra-zd230',
		model: 'ZD23042',
		shortDescription: 'Value desktop label printer with a simple, clamshell media load.',
		images: [img('label-zebra', 'Zebra ZD230 label printer')],
		mrp: 24900,
		discount: 0,
		availability: 'out-of-stock',
		category: cat('barcode-label-printers'),
		brand: brand('zebra'),
		specGroups: [
			group('Printing', [
				['Resolution', '203 dpi'],
				['Max print width', '104 mm'],
				['Speed', '6 ips'],
				['Interfaces', 'USB, optional Ethernet']
			])
		],
		documents: []
	}
];

const card = ({
	relatedSlugs,
	compare,
	images,
	overview,
	features,
	specGroups,
	documents,
	seo,
	...rest
}: Draft) => ({
	...rest,
	image: images[0]
});

export const products: ProductDetail[] = drafts.map((d) => {
	const bySlug = (s: string) => drafts.find((p) => p.slug === s)!;
	const explicit = (d.relatedSlugs ?? []).map((s) => card(bySlug(s)));
	const { relatedSlugs, compare, ...rest } = d;
	return {
		...rest,
		image: rest.images[0],
		related: explicit,
		comparison: compare && {
			intro: compare.intro,
			attributes: compare.attributes,
			products: compare.slugs.map((s) => ({ ...card(bySlug(s)), specGroups: bySlug(s).specGroups }))
		}
	};
});

export const productCards = drafts.map(card);

export const heroSlides = [
	{
		_key: 'h1',
		heading: 'ID cards your people will carry for years',
		subtitle:
			'Printers, cards, ribbons and lanyards for colleges, offices and factories — supplied, installed and serviced from Chennai.',
		image: img('face-employee', 'Employee ID card printed in full colour', 1016, 640),
		primaryCta: { label: 'Browse products', href: '/products' },
		secondaryCta: { label: 'Request a quote', href: '/contact' }
	},
	{
		_key: 'h2',
		heading: 'Student ID season, sorted',
		subtitle:
			'Printer, cards, holders and lanyards for your whole intake — delivered before orientation week.',
		image: img('face-student', 'Student ID card with college crest', 1016, 640),
		primaryCta: { label: 'See printers for colleges', href: '/products?category=id-card-printers' },
		secondaryCta: { label: 'Talk to us', href: '/contact' }
	},
	{
		_key: 'h3',
		heading: 'Access cards that open the right doors',
		subtitle: 'RFID and NFC cards printed and encoded to work with your existing readers.',
		image: img('face-access', 'Dark access control card with holographic overlay', 1016, 640),
		primaryCta: { label: 'Shop RFID & NFC cards', href: '/products?category=cards' }
	}
];

export const offers = [
	{
		_key: 'o1',
		title: 'Starter kit for new ID programmes',
		description:
			'Primacy 2 printer, one colour ribbon and 500 blank cards, with installation and a training session at your site.',
		image: img('printer-evolis', 'Evolis Primacy 2 printer'),
		cta: { label: 'Ask about the starter kit', href: '/contact?subject=Starter%20kit' },
		validUntil: '2026-12-31'
	},
	{
		_key: 'o2',
		title: 'Ribbons at 10% off in bulk',
		description:
			'Order ten or more colour ribbons of any brand this quarter and we take 10% off the MRP.',
		image: img('ribbon-magicard', 'Colour ribbon'),
		cta: { label: 'See all ribbons', href: '/products?category=printer-ribbons' },
		validUntil: '2026-12-31'
	}
];

export const gallery: GalleryItem[] = [
	{
		_id: 'g1',
		title: 'Front-desk badge station',
		description:
			'Primacy 2 installed for visitor and staff badges at a logistics office in Guindy.',
		category: 'installations',
		date: '2026-07-14',
		image: img('scene-desk', 'Card printer on a reception desk', 1200, 800)
	},
	{
		_id: 'g2',
		title: 'Orientation week batch',
		description:
			'2,400 student IDs printed, holed and paired with lanyards for an engineering college.',
		category: 'workshop',
		date: '2026-06-28',
		image: img('scene-batch', 'Sheet of freshly printed ID cards', 1200, 800)
	},
	{
		_id: 'g3',
		title: 'Live printing at Chennai Trade Expo',
		description: 'Visitors watched their own badges print on three different printers.',
		category: 'events',
		date: '2026-02-21',
		image: img('scene-expo', 'Exhibition stall with card printers', 1200, 800)
	},
	{
		_id: 'g4',
		title: 'Campus ID rollout',
		description: 'Staff and student cards with a college crest and gold stripe.',
		category: 'installations',
		date: '2026-05-10',
		image: img('scene-campus', 'College building with a student ID card', 1200, 800)
	},
	{
		_id: 'g5',
		title: 'Employee ID design',
		description: 'Wave-top design with barcode, printed edge to edge.',
		category: 'products',
		date: '2026-04-02',
		image: img('face-employee', 'Employee ID card design', 1016, 640)
	},
	{
		_id: 'g6',
		title: 'Access pass with overlay',
		description: 'Holographic overlay panel applied over a dark full-bleed design.',
		category: 'products',
		date: '2026-03-18',
		image: img('face-access', 'Access pass with holographic overlay', 1016, 640)
	},
	{
		_id: 'g7',
		title: 'Student ID design',
		description: 'Serif crest layout for a heritage institution.',
		category: 'products',
		date: '2026-03-02',
		image: img('face-student', 'Student ID card design', 1016, 640)
	},
	{
		_id: 'g8',
		title: 'Holder and lanyard sets',
		description: 'Rigid holders paired with two-colour printed lanyards.',
		category: 'workshop',
		date: '2026-01-22',
		image: img('lanyard', 'Lanyard with card')
	}
];

export const events: EventDetail[] = [
	{
		_id: 'e1',
		title: 'ID card printing demo day',
		slug: 'id-card-printing-demo-day-2026',
		startDate: '2026-10-17T10:00:00+05:30',
		endDate: '2026-10-17T16:00:00+05:30',
		location: 'SKT Technologies, Velachery, Chennai',
		summary: 'Bring your card design and print it on three different printers side by side.',
		coverImage: img('scene-desk', 'Card printer demo setup', 1200, 800),
		description: pt(
			'A hands-on day for administrators and HR teams choosing their next ID card printer.',
			{ h2: 'What to expect' },
			{
				list: [
					'Side-by-side prints on Evolis, Zebra and Magicard',
					'Encoding RFID cards for your access system',
					'Advice on card design, photos and data import'
				]
			},
			'Entry is free. Please register so we can keep a printer free for you.'
		),
		gallery: [img('scene-batch', 'Printed cards', 1200, 800)],
		registrationUrl: '/contact?subject=Demo%20day%20registration',
		registrationLabel: 'Register to attend'
	},
	{
		_id: 'e2',
		title: 'Campus Tech Expo Chennai',
		slug: 'campus-tech-expo-chennai-2026',
		startDate: '2026-11-20T09:30:00+05:30',
		endDate: '2026-11-22T18:00:00+05:30',
		location: 'Chennai Trade Centre, Nandambakkam',
		summary: 'Meet us at stall 214 for student ID, attendance and library card solutions.',
		coverImage: img('scene-expo', 'Exhibition stall', 1200, 800),
		description: pt(
			'We will be printing live student IDs and showing RFID attendance with common campus software.'
		),
		registrationUrl: '/contact?subject=Campus%20Tech%20Expo',
		registrationLabel: 'Book a meeting at the stall'
	},
	{
		_id: 'e3',
		title: 'Chennai Trade Expo 2026',
		slug: 'chennai-trade-expo-2026',
		startDate: '2026-02-20T10:00:00+05:30',
		endDate: '2026-02-22T18:00:00+05:30',
		location: 'Chennai Trade Centre, Nandambakkam',
		summary: 'Three days of live badge printing for visitors and exhibitors.',
		coverImage: img('scene-expo', 'Exhibition stall with card printers', 1200, 800),
		description: pt(
			'Over three days we printed more than 1,800 visitor badges on site, and demonstrated RFID encoding for access control.'
		),
		gallery: [
			img('scene-expo', 'Our stall', 1200, 800),
			img('scene-batch', 'Badges printed on the day', 1200, 800),
			img('face-access', 'Sample access pass', 1016, 640)
		]
	}
];

export const about: AboutPage = {
	heading: 'A Chennai supplier for every step of an ID card programme',
	intro:
		'We help institutions choose the right printer, set it up, and keep it printing — with cards, ribbons and lanyards always in stock nearby.',
	image: img('scene-desk', 'Card printer installed at a front desk', 1200, 800),
	body: pt(
		'SKT Technologies started by supplying blank cards and ribbons to schools in south Chennai. Customers kept asking us which printer to buy and who would fix it, so we became an authorised reseller for the brands we trusted and trained our own service team.',
		'Today we work with colleges, hospitals, factories and offices across Tamil Nadu. Most of our customers have been with us for years, because the card programme does not end once the printer is installed.'
	),
	facts: [
		{ _key: 'f1', value: '5', label: 'printer brands supported' },
		{ _key: 'f2', value: '48 h', label: 'typical on-site service response in Chennai' },
		{ _key: 'f3', value: '1 day', label: 'to dispatch in-stock consumables' }
	],
	values: [
		{
			_key: 'v1',
			title: 'Advice before sales',
			text: 'We recommend the smallest printer that does the job, and tell you when you do not need one.'
		},
		{
			_key: 'v2',
			title: 'Genuine consumables',
			text: 'Every ribbon and card we sell is sourced through authorised channels and matched to your printer.'
		},
		{
			_key: 'v3',
			title: 'Service that turns up',
			text: 'Our own technicians install, train and repair — no call centre in between.'
		}
	],
	process: [
		{
			_key: 's1',
			title: 'Tell us about your cards',
			text: 'How many people, how often you print, and whether cards need to open doors.'
		},
		{
			_key: 's2',
			title: 'Try a sample',
			text: 'We print your design on the printers that fit, so you can compare real cards.'
		},
		{
			_key: 's3',
			title: 'Install and train',
			text: 'We set up the printer and software on site and train the people who will use it.'
		},
		{
			_key: 's4',
			title: 'Keep printing',
			text: 'Reorder consumables in a message; service visits are booked within two working days.'
		}
	],
	sectors: [
		'Colleges and universities',
		'Schools',
		'Hospitals and clinics',
		'Factories and warehouses',
		'Corporate offices',
		'Events and conferences'
	],
	milestones: [
		{
			_key: 'm1',
			year: '2016',
			title: 'Started supplying cards and ribbons',
			text: 'Serving schools and small offices in south Chennai.'
		},
		{
			_key: 'm2',
			year: '2018',
			title: 'Authorised printer reseller',
			text: 'Added Evolis and Zebra card printers with in-house service.'
		},
		{
			_key: 'm3',
			year: '2021',
			title: 'RFID and NFC programmes',
			text: 'Began encoding access and attendance cards for campuses.'
		},
		{
			_key: 'm4',
			year: '2025',
			title: 'Lanyard printing in-house',
			text: 'Sublimation printing for lanyards with short lead times.'
		}
	]
};
