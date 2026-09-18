import { defineArrayMember, defineField, defineType } from 'sanity';
import { ImagesIcon } from '@sanity/icons/Images';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { imageWithAlt, displayOrder } from '../objects/shared';

export const galleryItem = defineType({
	name: 'galleryItem',
	title: 'Gallery item',
	type: 'document',
	icon: ImagesIcon,
	fields: [
		imageWithAlt('image', 'Image', { required: true }),
		defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
		defineField({ name: 'description', type: 'text', rows: 2 }),
		defineField({
			name: 'category',
			type: 'string',
			initialValue: 'installations',
			options: {
				list: [
					{ title: 'Installations', value: 'installations' },
					{ title: 'Card designs', value: 'products' },
					{ title: 'Events', value: 'events' },
					{ title: 'Our workshop', value: 'workshop' }
				],
				layout: 'radio'
			},
			validation: (rule) => rule.required()
		}),
		defineField({ name: 'date', type: 'date' }),
		displayOrder
	],
	orderings: [
		{ title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
		{ title: 'Newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }
	],
	preview: { select: { title: 'title', subtitle: 'category', media: 'image' } }
});

export const event = defineType({
	name: 'event',
	title: 'Event',
	type: 'document',
	icon: CalendarIcon,
	fields: [
		defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
		defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (rule) => rule.required() }),
		defineField({ name: 'published', title: 'Show on website', type: 'boolean', initialValue: false }),
		defineField({ name: 'startDate', title: 'Starts', type: 'datetime', validation: (rule) => rule.required() }),
		defineField({
			name: 'endDate',
			title: 'Ends',
			type: 'datetime',
			validation: (rule) =>
				rule.custom((end, ctx) => {
					const start = (ctx.document as { startDate?: string } | undefined)?.startDate;
					return !end || !start || end >= start ? true : 'End must be after the start.';
				})
		}),
		defineField({ name: 'location', type: 'string' }),
		defineField({ name: 'summary', type: 'text', rows: 2, description: 'One sentence for event lists.', validation: (rule) => rule.max(200) }),
		imageWithAlt('coverImage', 'Cover image'),
		defineField({ name: 'description', type: 'richText' }),
		defineField({
			name: 'gallery',
			title: 'Event photos',
			type: 'array',
			of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string' })] })],
			options: { layout: 'grid' }
		}),
		defineField({ name: 'registrationUrl', title: 'Registration / contact link', type: 'string', description: 'A site path like /contact?subject=Demo day, or a full URL.' }),
		defineField({ name: 'registrationLabel', title: 'Button label', type: 'string', initialValue: 'Register' }),
		defineField({ name: 'seo', type: 'seo' })
	],
	orderings: [{ title: 'Date, newest first', name: 'startDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
	preview: {
		select: { title: 'title', date: 'startDate', published: 'published', media: 'coverImage' },
		prepare: ({ title, date, published, media }) => ({
			title,
			subtitle: `${date ? new Date(date).toLocaleDateString('en-IN') : 'No date'}${published ? '' : ' (draft)'}`,
			media
		})
	}
});
