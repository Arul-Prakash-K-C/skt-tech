<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import type { PortableTextBlock } from '$lib/sanity/types';
	import PtLink from './PtLink.svelte';

	interface Props {
		value: PortableTextBlock[] | undefined;
		class?: string;
	}

	let { value, class: className = '' }: Props = $props();
</script>

{#if value?.length}
	<div class={['prose-skt', className]}>
		<PortableText {value} components={{ marks: { link: PtLink } }} />
	</div>
{/if}
