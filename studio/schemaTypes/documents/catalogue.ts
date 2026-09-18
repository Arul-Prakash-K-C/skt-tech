import { defineArrayMember, defineField, defineType } from 'sanity';
import { TagIcon } from '@sanity/icons/Tag';
import { StarIcon } from '@sanity/icons/Star';
import { PackageIcon } from '@sanity/icons/Package';
import { imageWithAlt, displayOrder } from '../objects/shared';

const slugField = (source: string) =>
	defineField({
		name: 'slug',
		type: 'slug',
		description: 'Used in the page address. Generate from the name, then avoid changing it once published.',
		options: { source, maxLength: 96 },
		validation: (rule) => rule.required()
	});

export const category = defineType({
	name: 'category',
	title: 'Product category',
	type: 'document',
	icon: TagIcon,
	fields: [
		defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
		slugField('title'),
		defineField({ name: 'description', type: 'text', rows: 2 }),
		imageWithAlt('image', 'Thumbnail'),
		displayOrder
	],
	orderings: [{ title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] }],
	preview: { select: { title: 'title', subtitle: 'description', media: 'image' } }
});

export const brand = defineType({
	name: 'brand',
	title: 'Brand',
	type: 'document',
	icon: StarIcon,
	fields: [
		defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
		slugField('name'),
		defineField({
			name: 'categories',
			title: 'Categories',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })],
			validation: (rule) => rule.unique()
		}),
		imageWithAlt('logo', 'Logo', { description: 'SVG or transparent PNG. Displayed in greyscale until hovered.' }),
		defineField({ name: 'description', type: 'text', rows: 3 }),
		defineField({ name: 'website', type: 'url' }),
		displayOrder,
		defineField({ name: 'active', title: 'Show on website', type: 'boolean', initialValue: true })
	],
	orderings: [{ title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] }],
	preview: {
		select: { title: 'name', active: 'active', media: 'logo' },
		prepare: ({ title, active, media }) => ({ title, subtitle: active === false ? 'Hidden' : undefined, media })
	}
});

export const product = defineType({
	name: 'product',
	title: 'Product',
	type: 'document',
	icon: PackageIcon,
	groups: [
		{ name: 'main', title: 'Basics', default: true },
		{ name: 'media', title: 'Images & files' },
		{ name: 'details', title: 'Details' },
		{ name: 'specs', title: 'Specifications' },
		{ name: 'relations', title: 'Compare & related' },
		{ name: 'seo', title: 'SEO' }
	],
	fields: [
		defineField({ name: 'name', type: 'string', group: 'main', validation: (rule) => rule.required() }),
		slugField('name'),
		defineField({ name: 'model', title: 'Model / SKU', type: 'string', group: 'main' }),
		defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }], group: 'main', validation: (rule) => rule.required() }),
		defineField({ name: 'brand', type: 'reference', to: [{ type: 'brand' }], group: 'main' }),
		defineField({ name: 'shortDescription', type: 'text', rows: 2, group: 'main', validation: (rule) => rule.max(180).warning('Keep it to one or two short sentences.') }),
		defineField({ name: 'mrp', title: 'MRP (₹)', type: 'number', group: 'main', description: 'Leave empty to show "Price on request".', validation: (rule) => rule.min(0) }),
		defineField({ name: 'discount', title: 'Discount (%)', type: 'number', group: 'main', initialValue: 0, validation: (rule) => rule.min(0).max(90) }),
		defineField({
			name: 'availability',
			type: 'string',
			group: 'main',
			initialValue: 'in-stock',
			options: {
				list: [
					{ title: 'In stock', value: 'in-stock' },
					{ title: 'Made to order', value: 'on-order' },
					{ title: 'Out of stock', value: 'out-of-stock' }
				],
				layout: 'radio'
			},
			validation: (rule) => rule.required()
		}),
		defineField({ name: 'featured', title: 'Feature on home page', type: 'boolean', group: 'main', initialValue: false }),
		{ ...displayOrder, group: 'main' },

		defineField({
			name: 'images',
			type: 'array',
			group: 'media',
			description: 'The first image is used on product cards. Product shots on a plain background work best.',
			of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string' })] })],
			validation: (rule) => rule.min(1).error('Add at least one image.')
		}),
		defineField({
			name: 'documents',
			title: 'Documents & catalogues',
			type: 'array',
			group: 'media',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'productDocument',
					fields: [
						defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
						defineField({ name: 'file', type: 'file', options: { accept: '.pdf,.zip,.doc,.docx,.xls,.xlsx' }, validation: (rule) => rule.required() })
					]
				})
			]
		}),

		defineField({ name: 'overview', type: 'richText', group: 'details' }),
		defineField({ name: 'features', title: 'Key features', type: 'array', group: 'details', of: [defineArrayMember({ type: 'string' })] }),

		defineField({
			name: 'specGroups',
			title: 'Specification groups',
			type: 'array',
			group: 'specs',
			description: 'e.g. "Printing", "Card handling". Row labels are also used by the comparison table.',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'specGroup',
					fields: [
						defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
						defineField({
							name: 'rows',
							type: 'array',
							of: [
								defineArrayMember({
									type: 'object',
									name: 'specRow',
									fields: [
										defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() }),
										defineField({ name: 'value', type: 'string', validation: (rule) => rule.required() })
									],
									preview: { select: { title: 'label', subtitle: 'value' } }
								})
							]
						})
					],
					preview: { select: { title: 'title' } }
				})
			]
		}),

		defineField({
			name: 'comparison',
			type: 'object',
			group: 'relations',
			description: 'Compares this product with up to three others, using matching specification labels.',
			fields: [
				defineField({ name: 'intro', type: 'string' }),
				defineField({
					name: 'products',
					title: 'Compare with',
					type: 'array',
					of: [
						defineArrayMember({
							type: 'reference',
							to: [{ type: 'product' }],
							options: { filter: ({ document }) => ({ filter: '_id != $id', params: { id: document._id.replace(/^drafts\./, '') } }) }
						})
					],
					validation: (rule) => rule.max(3).unique()
				}),
				defineField({
					name: 'attributes',
					title: 'Specifications to compare',
					type: 'array',
					description: 'Type spec row labels exactly as written, e.g. "Resolution".',
					of: [defineArrayMember({ type: 'string' })],
					options: { layout: 'tags' }
				})
			]
		}),
		defineField({
			name: 'relatedProducts',
			title: 'Related products',
			type: 'array',
			group: 'relations',
			description: 'If empty, other products from the same category are shown.',
			of: [
				defineArrayMember({
					type: 'reference',
					to: [{ type: 'product' }],
					options: { filter: ({ document }) => ({ filter: '_id != $id', params: { id: document._id.replace(/^drafts\./, '') } }) }
				})
			],
			validation: (rule) => rule.max(8).unique()
		}),

		defineField({ name: 'seo', type: 'seo', group: 'seo' })
	],
	orderings: [
		{ title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
		{ title: 'Name', name: 'name', by: [{ field: 'name', direction: 'asc' }] }
	],
	preview: {
		select: { title: 'name', brand: 'brand.name', category: 'category.title', media: 'images.0', featured: 'featured' },
		prepare: ({ title, brand, category, media, featured }) => ({
			title: featured ? `★ ${title}` : title,
			subtitle: [brand, category].filter(Boolean).join(' — '),
			media
		})
	}
});
