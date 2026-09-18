import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { structure, SINGLETONS } from './structure';

export default defineConfig({
	name: 'default',
	title: 'SKT Technologies',
	projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
	dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

	plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: '2026-09-01' })],

	schema: {
		types: schemaTypes,
		// Singletons can't be created from the "new document" menu
		templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType))
	},

	document: {
		// …nor duplicated or deleted
		actions: (actions, { schemaType }) =>
			SINGLETONS.includes(schemaType)
				? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
				: actions
	}
});
