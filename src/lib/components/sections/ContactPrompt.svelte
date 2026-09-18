<script lang="ts">
	import type { Cta, SiteSettings } from '$lib/sanity/types';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { phoneHref } from '$lib/utils/format';

	interface Props {
		heading: string;
		text?: string;
		cta?: Cta;
		settings: SiteSettings;
	}

	let { heading, text, cta, settings }: Props = $props();
</script>

<section class="shell py-16 md:py-24" aria-labelledby="contact-prompt">
	<div class="panel">
		<div class="max-w-2xl">
			<h2 id="contact-prompt" class="h2 text-white">{heading}</h2>
			{#if text}<p class="mt-4 text-lg leading-relaxed text-white/70">{text}</p>{/if}
		</div>
		<div class="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
			<Button href={cta?.href ?? '/contact'} variant="inverse" size="lg"
				>{cta?.label ?? 'Contact us'}</Button
			>
			{#if settings.phone}
				<a href="tel:{phoneHref(settings.phone)}" class="phone">
					<Icon name="phone" size={18} />
					<span class="num">{settings.phone}</span>
				</a>
			{/if}
		</div>
	</div>
</section>

<style>
	.panel {
		position: relative;
		display: grid;
		gap: 2rem;
		padding: clamp(2rem, 5vw, 4rem);
		border-radius: var(--radius-lg);
		background: var(--color-ink);
		overflow: hidden;
	}
	@media (min-width: 1024px) {
		.panel {
			grid-template-columns: 1fr auto;
			align-items: end;
		}
	}
	/* Faint CR80 outline in the corner, the only ornament on the panel */
	.panel::after {
		content: '';
		position: absolute;
		right: -3rem;
		top: -4rem;
		width: 22rem;
		aspect-ratio: 1.586;
		border: 1.5px solid rgb(143 211 238 / 0.18);
		border-radius: 3.7% / 5.9%;
		transform: rotate(-8deg);
		pointer-events: none;
	}
	.phone {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 3.25rem;
		padding-inline: 1.25rem;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgb(255 255 255 / 0.25);
		color: white;
		font-weight: 560;
		transition: border-color var(--dur-2) var(--ease-out);
	}
	.phone:hover {
		border-color: white;
	}
</style>
