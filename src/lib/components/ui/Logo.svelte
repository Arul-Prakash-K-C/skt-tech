<script lang="ts">
	import logoUrl from '$lib/assets/skt-logo.webp';

	interface Props {
		name?: string;
		inverse?: boolean;
		/** Mark only, no wordmark */
		compact?: boolean;
	}

	let { name = 'SKT Technologies', inverse = false, compact = false }: Props = $props();

	// "SKT Technologies" → "SKT" + "Technologies"
	const parts = $derived.by(() => {
		const [first, ...rest] = name.split(' ');
		return { first, rest: rest.join(' ') };
	});
</script>

<span class={['logo', inverse && 'inverse']}>
	<img class="mark" src={logoUrl} alt="" width="90" height="90" decoding="async" />
	{#if !compact}
		<span class="word">
			<span class="first">{parts.first}</span>
			{#if parts.rest}<span class="rest">{parts.rest}</span>{/if}
		</span>
	{/if}
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
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 10px;
		flex: none;
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
