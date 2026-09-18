<script lang="ts" module>
	const PATHS = {
		menu: 'M4 7h16M4 12h16M4 17h16',
		close: 'M6 6l12 12M18 6L6 18',
		search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4',
		'chevron-left': 'M15 5l-7 7 7 7',
		'chevron-right': 'M9 5l7 7-7 7',
		'chevron-down': 'M5 9l7 7 7-7',
		arrow: 'M5 12h14m-6-6 6 6-6 6',
		phone:
			'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
		mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
		pin: 'M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
		clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
		download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
		external: 'M14 5h5v5m0-5-8 8M10 5H5v14h14v-5',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		filter: 'M4 6h16M7 12h10M10 18h4',
		calendar: 'M4 7h16v13H4zM4 11h16M8 4v4m8-4v4',
		expand: 'M9 4H4v5m0-5 6 6m5-6h5v5m0-5-6 6M4 15v5h5m-5 0 6-6m10 1v5h-5m5 0-6-6',
		whatsapp:
			'M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Zm5-11.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1a4.5 4.5 0 0 1-3-3l1-1-1-2L9 8.5Z',
		alert:
			'M12 8v5m0 3.5v.5M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		name: IconName;
		size?: number;
		class?: ClassValue;
		label?: string;
	}

	let { name, size = 20, class: className = '', label }: Props = $props();
</script>

<svg
	class={['shrink-0', className]}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path d={PATHS[name]} />
</svg>
