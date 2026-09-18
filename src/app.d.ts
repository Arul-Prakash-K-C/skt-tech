// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface PageState {
			/** Id of the gallery item open in the lightbox (shallow routing). */
			lightbox?: string;
		}
	}
}

export {};
