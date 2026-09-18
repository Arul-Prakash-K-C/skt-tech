import { defineArrayMember, defineField, defineType } from 'sanity';
import { LinkIcon } from '@sanity/icons/Link';

/** Image with hotspot and required alt text — the only image shape used. */
export const imageWithAlt = (name: string, title: string, opts: { required?: boolean; description?: string } = {}) =>
	defineField({
		name,
		title,
		type: 'image',
		description: opts.description,
		options: { hotspot: true },
		fields: [
			defineField({
				name: 'alt',
				title: 'Alternative text',
				type: 'string',
				description: 'Describe the image for people using screen readers and for search engines.',
				validation: (rule) => rule.required().warning('Alt text helps accessibility and SEO.')
			})
		],
		validation: opts.required ? (rule) => rule.required() : undefined
	});

export const displayOrder = defineField({
	name: 'displayOrder',
	title: 'Display order',
	type: 'number',
	description: 'Lower numbers are shown first.',
	initialValue: 100,
	validation: (rule) => rule.integer().min(0)
});

export const cta = defineType({
	name: 'cta',
	title: 'Call to action',
	type: 'object',
	icon: LinkIcon,
	fields: [
		defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(40) }),
		defineField({
			name: 'href',
			title: 'Link',
			type: 'string',
			description: 'A site path like /products?category=cards, or a full https:// URL.',
			validation: (rule) =>
				rule.required().custom((v) =>
					!v || v.startsWith('/') || /^https?:\/\//.test(v) || /^(mailto|tel):/.test(v)
						? true
						: 'Start with /, https://, mailto: or tel:'
				)
		})
	],
	preview: { select: { title: 'label', subtitle: 'href' } }
});

export const seo = defineType({
	name: 'seo',
	title: 'SEO',
	type: 'object',
	options: { collapsible: true, collapsed: true },
	fields: [
		defineField({ name: 'title', type: 'string', description: 'Overrides the page title in search results.', validation: (rule) => rule.max(70).warning('Keep under 70 characters.') }),
		defineField({ name: 'description', type: 'text', rows: 3, validation: (rule) => rule.max(170).warning('Keep under 170 characters.') }),
		imageWithAlt('image', 'Social share image', { description: '1200 × 630 works best.' }),
		defineField({ name: 'noIndex', title: 'Hide from search engines', type: 'boolean', initialValue: false })
	]
});

/** Rich text used for overviews and descriptions. */
export const richText = defineType({
	name: 'richText',
	title: 'Rich text',
	type: 'array',
	of: [
		defineArrayMember({
			type: 'block',
			styles: [
				{ title: 'Paragraph', value: 'normal' },
				{ title: 'Heading', value: 'h2' },
				{ title: 'Subheading', value: 'h3' },
				{ title: 'Quote', value: 'blockquote' }
			],
			lists: [
				{ title: 'Bullets', value: 'bullet' },
				{ title: 'Numbered', value: 'number' }
			],
			marks: {
				decorators: [
					{ title: 'Bold', value: 'strong' },
					{ title: 'Italic', value: 'em' }
				],
				annotations: [
					defineArrayMember({
						name: 'link',
						type: 'object',
						title: 'Link',
						fields: [defineField({ name: 'href', type: 'string', validation: (rule) => rule.required() })]
					})
				]
			}
		})
	]
});

export const titledText = defineType({
	name: 'titledText',
	title: 'Item',
	type: 'object',
	fields: [
		defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
		defineField({ name: 'text', type: 'text', rows: 3 })
	]
});
