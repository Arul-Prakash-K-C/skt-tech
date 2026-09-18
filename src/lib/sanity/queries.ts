/**
 * GROQ queries. Every query projects exactly the fields the UI needs, into
 * the shapes declared in `types.ts`. Fragments keep projections consistent.
 */

const groq = String.raw;

/** Image → `Img`. One asset dereference, merged (not repeated). */
export const IMG = groq`{
	"ref": asset._ref,
	alt,
	hotspot,
	crop,
	...(asset->{
		url,
		"width": metadata.dimensions.width,
		"height": metadata.dimensions.height,
		"lqip": metadata.lqip
	})
}`;

const SEO = groq`seo{ title, description, noIndex, "image": image${IMG} }`;

const CTA = groq`{ label, href }`;

/** Product listing card fields (a field list, so it can be extended). */
const CARD_FIELDS = groq`
	_id,
	name,
	"slug": slug.current,
	model,
	shortDescription,
	"image": images[0]${IMG},
	mrp,
	discount,
	"availability": coalesce(availability, "in-stock"),
	featured,
	"category": category->{ title, "slug": slug.current },
	"brand": brand->{ name, "slug": slug.current }
`;

export const PRODUCT_CARD = `{${CARD_FIELDS}}`;

const SPEC_GROUPS = groq`specGroups[]{ _key, title, rows[]{ _key, label, value } }`;

const EVENT_FIELDS = groq`
	_id,
	title,
	"slug": slug.current,
	startDate,
	endDate,
	location,
	summary,
	"coverImage": coverImage${IMG}
`;

const EVENT_SUMMARY = `{${EVENT_FIELDS}}`;

const BRAND_SUMMARY = groq`{ _id, name, "slug": slug.current, "logo": logo${IMG} }`;

const PUBLISHED_PRODUCT = groq`_type == "product" && defined(slug.current)`;
const ACTIVE_BRAND = groq`_type == "brand" && active != false && defined(slug.current)`;
const PUBLISHED_EVENT = groq`_type == "event" && published == true && defined(slug.current)`;

export const SETTINGS_QUERY = groq`*[_id == "siteSettings"][0]{
	companyName,
	legalName,
	tagline,
	description,
	phone,
	whatsapp,
	email,
	address,
	mapUrl,
	hours,
	gstin,
	social[]{ _key, platform, url },
	footerNote,
	"defaultSeo": ${SEO}
}`;

export const NAV_CATEGORIES_QUERY = groq`*[_type == "category" && defined(slug.current)]
	| order(displayOrder asc, title asc){ _id, title, "slug": slug.current }`;

export const HOME_QUERY = groq`{
	"page": *[_id == "homePage"][0]{
		heroSlides[]{
			_key,
			heading,
			subtitle,
			"image": image${IMG},
			"primaryCta": primaryCta${CTA},
			"secondaryCta": secondaryCta${CTA}
		},
		offers[]{
			_key,
			title,
			description,
			validUntil,
			"image": image${IMG},
			"cta": cta${CTA}
		},
		categoriesHeading,
		categoriesIntro,
		featuredHeading,
		featuredIntro,
		contactPrompt{ heading, text, "cta": cta${CTA} },
		${SEO}
	},
	"featuredProducts": *[${PUBLISHED_PRODUCT} && featured == true]
		| order(displayOrder asc, _updatedAt desc)[0...8]${PRODUCT_CARD},
	"brands": *[${ACTIVE_BRAND}] | order(displayOrder asc, name asc)${BRAND_SUMMARY},
	"categories": *[_type == "category" && defined(slug.current)] | order(displayOrder asc, title asc){
		_id,
		title,
		"slug": slug.current,
		description,
		"image": image${IMG},
		"productCount": count(*[${PUBLISHED_PRODUCT} && category._ref == ^._id])
	},
	"upcomingEvents": *[${PUBLISHED_EVENT} && coalesce(endDate, startDate) >= now()]
		| order(startDate asc)[0...3]${EVENT_SUMMARY}
}`;

export const PRODUCTS_QUERY = groq`{
	"products": *[${PUBLISHED_PRODUCT}] | order(displayOrder asc, name asc)${PRODUCT_CARD},
	"categories": *[_type == "category" && defined(slug.current)]
		| order(displayOrder asc, title asc){ _id, title, "slug": slug.current, description },
	"brands": *[${ACTIVE_BRAND}] | order(displayOrder asc, name asc)${BRAND_SUMMARY}
}`;

export const PRODUCT_QUERY = groq`*[${PUBLISHED_PRODUCT} && slug.current == $slug][0]{
	${CARD_FIELDS},
	_updatedAt,
	"images": images[]${IMG},
	overview,
	features,
	${SPEC_GROUPS},
	comparison{
		intro,
		"attributes": coalesce(attributes, []),
		"products": coalesce(products[]->{ ${CARD_FIELDS}, ${SPEC_GROUPS} }, [])
	},
	"documents": documents[defined(file.asset)]{
		_key,
		title,
		...(file.asset->{ url, size, extension })
	},
	"related": coalesce(relatedProducts[]->${PRODUCT_CARD}, []),
	"sameCategory": *[${PUBLISHED_PRODUCT} && category._ref == ^.category._ref && _id != ^._id]
		| order(featured desc, displayOrder asc)[0...4]${PRODUCT_CARD},
	${SEO}
}`;

export const BRANDS_QUERY = groq`*[${ACTIVE_BRAND}] | order(displayOrder asc, name asc){
	_id,
	name,
	"slug": slug.current,
	"logo": logo${IMG},
	description,
	website,
	"categories": categories[]->{ title, "slug": slug.current },
	"productCount": count(*[${PUBLISHED_PRODUCT} && brand._ref == ^._id])
}`;

export const GALLERY_QUERY = groq`*[_type == "galleryItem" && defined(image.asset)]
	| order(displayOrder asc, date desc){
	_id,
	title,
	description,
	"category": coalesce(category, "products"),
	date,
	"image": image${IMG}
}`;

export const EVENTS_QUERY = groq`*[${PUBLISHED_EVENT}] | order(startDate desc)${EVENT_SUMMARY}`;

export const EVENT_QUERY = groq`*[${PUBLISHED_EVENT} && slug.current == $slug][0]{
	${EVENT_FIELDS},
	description,
	"gallery": gallery[]${IMG},
	registrationUrl,
	registrationLabel,
	${SEO}
}`;

export const ABOUT_QUERY = groq`*[_id == "aboutPage"][0]{
	heading,
	intro,
	"image": image${IMG},
	body,
	facts[]{ _key, value, label },
	values[]{ _key, title, text },
	process[]{ _key, title, text },
	sectors,
	milestones[]{ _key, year, title, text },
	${SEO}
}`;

export const SITEMAP_QUERY = groq`{
	"products": *[${PUBLISHED_PRODUCT} && seo.noIndex != true]{ "slug": slug.current, _updatedAt },
	"events": *[${PUBLISHED_EVENT} && seo.noIndex != true]{ "slug": slug.current, _updatedAt }
}`;
