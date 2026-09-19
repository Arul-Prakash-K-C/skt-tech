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
		<div class="relative max-w-2xl">
			<h2 id="contact-prompt" class="h2">{heading}</h2>
			{#if text}<p class="mt-4 text-lg leading-relaxed text-ink/75">{text}</p>{/if}
		</div>
		<div class="actions relative flex flex-col gap-3 sm:flex-row">
			<Button href={cta?.href ?? '/contact'} size="lg">{cta?.label ?? 'Contact us'}</Button>
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
	/* Process yellow, with the three other ribbon panels as a stacked card corner */
	.panel {
		position: relative;
		display: grid;
		gap: 2rem;
		padding: clamp(2rem, 5vw, 4rem);
		border-radius: var(--radius-lg);
		background: var(--color-process-yellow);
		color: var(--color-ink);
		overflow: hidden;
		isolation: isolate;
	}
	/* A fanned stack of blank cards in the other ribbon panels, kept to the
	   top-right corner so it never sits behind the actions */
	.panel::before,
	.panel::after {
		content: '';
		position: absolute;
		z-index: -1;
		top: -2.5rem;
		right: -3rem;
		width: clamp(10rem, 20vw, 16rem);
		aspect-ratio: 1.586;
		border-radius: 3.7% / 5.9%;
		box-shadow: 0 18px 30px -18px rgb(15 34 51 / 0.45);
		pointer-events: none;
	}
	.panel::before {
		background: var(--color-process-cyan);
		transform: rotate(18deg) translate(-2.5rem, -0.5rem);
	}
	.panel::after {
		background: var(--color-process-magenta);
		transform: rotate(-6deg);
	}
	@media (min-width: 1024px) {
		.panel {
			padding-right: clamp(4rem, 18vw, 17rem);
		}
		.actions {
			align-self: end;
		}
	}
	@media (max-width: 1023px) {
		.panel::before,
		.panel::after {
			width: 9rem;
			top: -3.5rem;
			right: -3.5rem;
		}
	}
	.phone {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 3.25rem;
		padding-inline: 1.25rem;
		border-radius: 999px;
		border: 1.5px solid rgb(15 34 51 / 0.3);
		color: var(--color-ink);
		font-weight: 560;
		transition: border-color var(--dur-2) var(--ease-out);
	}
	.phone:hover {
		border-color: var(--color-ink);
	}
</style>
