<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		text?: string;
		children?: Snippet;
	}

	let { title, text, children }: Props = $props();
</script>

<div class="rounded-card border border-dashed border-line-strong bg-stock px-6 py-14 text-center">
	<!-- A blank CR80 card outline: the "nothing printed yet" state -->
	<svg
		class="mx-auto mb-5 text-line-strong"
		width="64"
		height="41"
		viewBox="0 0 64 41"
		aria-hidden="true"
	>
		<rect
			x="1"
			y="1"
			width="62"
			height="39"
			rx="5"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-dasharray="4 4"
		/>
	</svg>
	<p class="h3">{title}</p>
	{#if text}<p class="mx-auto mt-2 max-w-md text-muted">{text}</p>{/if}
	{#if children}<div class="mt-6 flex justify-center gap-3">{@render children()}</div>{/if}
</div>
