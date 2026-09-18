import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { HomeIcon } from '@sanity/icons/Home';
import { UsersIcon } from '@sanity/icons/Users';
import { imageWithAlt } from '../objects/shared';

export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Company & site settings',
	type: 'document',
	icon: CogIcon,
	groups: [
		{ name: 'company', title: 'Company', default: true },
		{ name: 'contact', title: 'Contact' },
		{ name: 'seo', title: 'SEO' }
	],
	fields: [
		defineField({ name: 'companyName', type: 'string', group: 'company', validation: (rule) => rule.required() }),
		defineField({ name: 'legalName', type: 'string', group: 'company', description: 'Shown in the footer copyright line.' }),
		defineField({ name: 'tagline', type: 'string', group: 'company', description: 'Used in the home page title.' }),
		defineField({ name: 'description', type: 'text', rows: 3, group: 'company', description: 'One or two sentences about the company. Used in the footer and as the default meta description.' }),
		defineField({ name: 'gstin', title: 'GSTIN', type: 'string', group: 'company', validation: (rule) => rule.regex(/^[0-9A-Z]{15}$/).warning('A GSTIN has 15 characters.') }),
		defineField({ name: 'footerNote', type: 'string', group: 'company', description: 'Small print, e.g. pricing and GST notes.' }),
		defineField({ name: 'phone', type: 'string', group: 'contact' }),
		defineField({ name: 'whatsapp', title: 'WhatsApp number', type: 'string', group: 'contact', description: 'With country code, e.g. +91 98xxx xxxxx' }),
		defineField({ name: 'email', type: 'string', group: 'contact', validation: (rule) => rule.email() }),
		defineField({ name: 'address', type: 'text', rows: 2, group: 'contact' }),
		defineField({ name: 'mapUrl', title: 'Map link', type: 'url', group: 'contact' }),
		defineField({ name: 'hours', title: 'Opening hours', type: 'string', group: 'contact' }),
		defineField({
			name: 'social',
			title: 'Social profiles',
			type: 'array',
			group: 'contact',
			of: [
				defineArrayMember({
					type: 'object',
					fields: [
						defineField({ name: 'platform', type: 'string', validation: (rule) => rule.required() }),
						defineField({ name: 'url', type: 'url', validation: (rule) => rule.required() })
					]
				})
			]
		}),
		defineField({ name: 'seo', title: 'Default SEO', type: 'seo', group: 'seo' })
	],
	preview: { prepare: () => ({ title: 'Company & site settings' }) }
});

export const homePage = defineType({
	name: 'homePage',
	title: 'Home page',
	type: 'document',
	icon: HomeIcon,
	groups: [
		{ name: 'hero', title: 'Hero', default: true },
		{ name: 'offers', title: 'Offers' },
		{ name: 'sections', title: 'Sections' },
		{ name: 'seo', title: 'SEO' }
	],
	fields: [
		defineField({
			name: 'heroSlides',
			title: 'Hero slides',
			type: 'array',
			group: 'hero',
			description: 'The slide image is shown as the face of an ID card, so card designs and photos crop best.',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'heroSlide',
					fields: [
						defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required().max(70) }),
						defineField({ name: 'subtitle', type: 'text', rows: 2, validation: (rule) => rule.max(200) }),
						imageWithAlt('image', 'Banner image', { required: true }),
						defineField({ name: 'primaryCta', title: 'Primary button', type: 'cta' }),
						defineField({ name: 'secondaryCta', title: 'Secondary button', type: 'cta' })
					],
					preview: { select: { title: 'heading', subtitle: 'subtitle', media: 'image' } }
				})
			],
			validation: (rule) => rule.min(1).max(5)
		}),
		defineField({
			name: 'offers',
			title: 'Offers & promotions',
			type: 'array',
			group: 'offers',
			description: 'Offers disappear from the site automatically after their end date.',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'offer',
					fields: [
						defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
						defineField({ name: 'description', type: 'text', rows: 3 }),
						imageWithAlt('image', 'Offer image'),
						defineField({ name: 'cta', title: 'Button', type: 'cta' }),
						defineField({ name: 'validUntil', title: 'Valid until', type: 'date' })
					],
					preview: { select: { title: 'title', subtitle: 'validUntil', media: 'image' } }
				})
			]
		}),
		defineField({ name: 'categoriesHeading', type: 'string', group: 'sections' }),
		defineField({ name: 'categoriesIntro', type: 'text', rows: 2, group: 'sections' }),
		defineField({ name: 'featuredHeading', title: 'Featured products heading', type: 'string', group: 'sections', description: 'Products marked "Featured" appear in this section.' }),
		defineField({ name: 'featuredIntro', title: 'Featured products intro', type: 'text', rows: 2, group: 'sections' }),
		defineField({
			name: 'contactPrompt',
			title: 'Closing call to action',
			type: 'object',
			group: 'sections',
			fields: [
				defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required() }),
				defineField({ name: 'text', type: 'text', rows: 3 }),
				defineField({ name: 'cta', title: 'Button', type: 'cta' })
			]
		}),
		defineField({ name: 'seo', type: 'seo', group: 'seo' })
	],
	preview: { prepare: () => ({ title: 'Home page' }) }
});

export const aboutPage = defineType({
	name: 'aboutPage',
	title: 'About page',
	type: 'document',
	icon: UsersIcon,
	fields: [
		defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required() }),
		defineField({ name: 'intro', type: 'text', rows: 3 }),
		imageWithAlt('image', 'Lead image'),
		defineField({
			name: 'facts',
			title: 'Key facts',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					fields: [
						defineField({ name: 'value', type: 'string', description: 'e.g. "48 h"', validation: (rule) => rule.required() }),
						defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() })
					],
					preview: { select: { title: 'value', subtitle: 'label' } }
				})
			],
			validation: (rule) => rule.max(4)
		}),
		defineField({ name: 'body', title: 'Our story', type: 'richText' }),
		defineField({ name: 'values', title: 'Commitments', type: 'array', of: [defineArrayMember({ type: 'titledText' })] }),
		defineField({ name: 'process', title: 'How we work (steps, in order)', type: 'array', of: [defineArrayMember({ type: 'titledText' })] }),
		defineField({ name: 'sectors', title: 'Sectors served', type: 'array', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
		defineField({
			name: 'milestones',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					fields: [
						defineField({ name: 'year', type: 'string', validation: (rule) => rule.required() }),
						defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
						defineField({ name: 'text', type: 'text', rows: 2 })
					],
					preview: { select: { title: 'title', subtitle: 'year' } }
				})
			]
		}),
		defineField({ name: 'seo', type: 'seo' })
	],
	preview: { prepare: () => ({ title: 'About page' }) }
});
