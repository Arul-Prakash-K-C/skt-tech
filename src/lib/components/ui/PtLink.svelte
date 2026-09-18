<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MarkComponentProps } from '@portabletext/svelte';

	interface Props {
		portableText: MarkComponentProps<{ href?: string }>;
		children: Snippet;
	}

	let { portableText, children }: Props = $props();

	const href = $derived(portableText.value?.href ?? '');
	const external = $derived(/^https?:\/\//.test(href));
</script>

<a
	{href}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
>
	{@render children()}
</a>
