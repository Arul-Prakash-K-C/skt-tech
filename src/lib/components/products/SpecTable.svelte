<script lang="ts">
	import type { SpecGroup } from '$lib/sanity/types';

	interface Props {
		groups: SpecGroup[];
	}

	let { groups }: Props = $props();
</script>

<div class="grid gap-x-12 gap-y-10 md:grid-cols-2">
	{#each groups as group (group._key)}
		<div>
			<h3 class="text-[0.9375rem] font-semibold text-ink">{group.title}</h3>
			<dl class="mt-3 border-t border-ink">
				{#each group.rows as row (row._key)}
					<div
						class="grid grid-cols-[minmax(7.5rem,40%)_1fr] gap-4 border-b border-line py-3 text-[0.9375rem]"
					>
						<dt class="text-muted">{row.label}</dt>
						<dd class="num text-ink">{row.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/each}
</div>
