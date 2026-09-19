<script lang="ts">
	interface Props {
		name?: string;
		inverse?: boolean;
	}

	let { name = 'SKT Technologies', inverse = false }: Props = $props();

	// "SKT Technologies" → "SKT" + "Technologies"
	const parts = $derived.by(() => {
		const [first, ...rest] = name.split(' ');
		return { first, rest: rest.join(' ') };
	});
</script>

<span class={['logo', inverse && 'inverse']}>
	<!-- Mark: four ribbon panels (Y, M, C, K) laid like a card edge -->
	<svg class="mark" viewBox="0 0 28 28" aria-hidden="true">
		<rect
			x="2"
			y="5"
			width="24"
			height="18"
			rx="3"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		/>
		<rect x="6" y="9" width="3" height="10" rx="1" fill="#ffd100" />
		<rect x="10.5" y="9" width="3" height="10" rx="1" fill="#e4007c" />
		<rect x="15" y="9" width="3" height="10" rx="1" fill="#00a3e0" />
		<rect x="19.5" y="9" width="3" height="10" rx="1" fill="currentColor" />
	</svg>
	<span class="word">
		<span class="first">{parts.first}</span>
		{#if parts.rest}<span class="rest">{parts.rest}</span>{/if}
	</span>
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		color: var(--color-ink);
	}
	.inverse {
		color: white;
	}
	.mark {
		width: 1.875rem;
		height: 1.875rem;
	}
	.word {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		line-height: 1;
	}
	.first {
		font-variation-settings: 'wdth' 125;
		font-weight: 760;
		font-size: 1.1875rem;
		letter-spacing: 0.01em;
	}
	.rest {
		font-variation-settings: 'wdth' 100;
		font-weight: 480;
		font-size: 0.9375rem;
		opacity: 0.8;
	}
</style>
