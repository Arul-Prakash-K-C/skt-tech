<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import type { HeroSlide } from '$lib/sanity/types';
	import SanityImage from '$lib/components/ui/SanityImage.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	interface Props {
		slides: HeroSlide[];
	}

	let { slides }: Props = $props();

	const SLIDE_MS = 7000;
	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

	let current = $state(0);
	let paused = $state(false); // user toggle
	let hovering = $state(false);

	const slide = $derived(slides[current]);
	const multiple = $derived(slides.length > 1);
	const autoplay = $derived(multiple && !paused && !reducedMotion.current);

	function go(i: number) {
		current = (i + slides.length) % slides.length;
	}
</script>

{#if slide}
	<section
		class="hero"
		aria-roledescription="carousel"
		aria-label="Highlights"
		onpointerenter={() => (hovering = true)}
		onpointerleave={() => (hovering = false)}
		onfocusin={() => (hovering = true)}
		onfocusout={() => (hovering = false)}
	>
		<div
			class="shell grid items-center gap-10 pt-8 pb-14 md:pt-12 lg:grid-cols-12 lg:gap-8 lg:pt-16 lg:pb-24"
		>
			<!-- Copy -->
			<div class="lg:col-span-6" aria-live={autoplay ? 'off' : 'polite'}>
				{#key current}
					<div
						class="copy"
						role="group"
						aria-roledescription="slide"
						aria-label="{current + 1} of {slides.length}"
					>
						<h1 class="display max-w-[14ch]">{slide.heading}</h1>
						{#if slide.subtitle}<p class="lede mt-6">{slide.subtitle}</p>{/if}
						{#if slide.primaryCta || slide.secondaryCta}
							<div class="mt-9 flex flex-wrap gap-3">
								{#if slide.primaryCta}
									<Button href={slide.primaryCta.href} size="lg">{slide.primaryCta.label}</Button>
								{/if}
								{#if slide.secondaryCta}
									<Button href={slide.secondaryCta.href} size="lg" variant="secondary"
										>{slide.secondaryCta.label}</Button
									>
								{/if}
							</div>
						{/if}
					</div>
				{/key}

				{#if multiple}
					<div class="mt-12 flex items-center gap-4">
						<div class="flex items-center gap-1">
							<button class="ctrl" aria-label="Previous slide" onclick={() => go(current - 1)}>
								<Icon name="chevron-left" size={18} />
							</button>
							<button class="ctrl" aria-label="Next slide" onclick={() => go(current + 1)}>
								<Icon name="chevron-right" size={18} />
							</button>
							{#if !reducedMotion.current}
								<button
									class="ctrl"
									aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
									onclick={() => (paused = !paused)}
								>
									{#if paused}
										<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"
											><path d="M3 1.5v11l9.5-5.5z" fill="currentColor" /></svg
										>
									{:else}
										<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"
											><path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" /></svg
										>
									{/if}
								</button>
							{/if}
						</div>
						<ol class="flex flex-1 gap-2" aria-label="Choose slide">
							{#each slides as s, i (s._key)}
								<li class="flex-1">
									<button
										class="pip"
										aria-label="Slide {i + 1}: {s.heading}"
										aria-current={i === current ? 'true' : undefined}
										onclick={() => go(i)}
									>
										<span
											class={[
												'fill',
												(i < current || (i === current && !autoplay)) && 'done',
												i === current && autoplay && 'run'
											]}
											style:--dur="{SLIDE_MS}ms"
											style:--state={hovering ? 'paused' : 'running'}
											onanimationend={() => i === current && go(current + 1)}
										></span>
									</button>
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			</div>

			<!-- Print stage -->
			<div class="lg:col-span-6">
				<div class="stage">
					{#key current}
						<div class="card-wrap">
							<div class="card">
								<div class="face">
									<SanityImage
										image={slide.image}
										width={640}
										aspect={1.586}
										sizes="(min-width: 1024px) 40vw, 90vw"
										priority={current === 0}
										class="h-full w-full object-cover"
									/>
								</div>
								<span class="gloss" aria-hidden="true"></span>
							</div>
							<div class="track" aria-hidden="true">
								<span class="head"><i></i><i></i><i></i><i></i></span>
							</div>
						</div>
					{/key}
					<div class="tray" aria-hidden="true"></div>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.hero {
		position: relative;
		overflow: hidden;
	}

	/* Copy enters once per slide */
	.copy {
		animation: copy-in 700ms var(--ease-out) both;
	}
	@keyframes copy-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	.ctrl {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid var(--color-line-strong);
		border-radius: 50%;
		background: var(--color-stock);
		color: var(--color-ink);
		transition:
			border-color var(--dur-2) var(--ease-out),
			transform var(--dur-1) var(--ease-out);
	}
	.ctrl:hover {
		border-color: var(--color-ink);
	}
	.ctrl:active {
		transform: scale(0.94);
	}

	.pip {
		display: block;
		width: 100%;
		padding-block: 0.75rem;
		cursor: pointer;
	}
	.fill {
		position: relative;
		display: block;
		height: 3px;
		border-radius: 2px;
		background: var(--color-line);
		overflow: hidden;
	}
	.fill::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--color-ink);
		transform: scaleX(0);
		transform-origin: left;
	}
	.fill.done::after {
		transform: scaleX(1);
	}
	/* While autoplaying, the active pip fills over the slide duration */
	.fill.run::after {
		animation: pip-fill var(--dur) linear forwards;
		animation-play-state: var(--state);
	}
	@keyframes pip-fill {
		to {
			transform: scaleX(1);
		}
	}

	/* ---- Stage ---------------------------------------------------------- */
	.stage {
		position: relative;
		width: min(100%, 36rem);
		margin-inline: auto;
		padding: 6% 4% 9%;
	}
	.tray {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 3%;
		height: 10px;
		border-radius: 6px;
		background: linear-gradient(var(--color-line), var(--color-shade));
	}
	.card-wrap {
		position: relative;
		transform: rotate(-3.5deg);
		animation: settle 900ms var(--ease-spring) 1.5s both;
	}
	@keyframes settle {
		from {
			transform: rotate(-3.5deg) translateY(-10px);
		}
	}
	.card {
		position: relative;
		aspect-ratio: 1.586;
		/* CR80 corners are 3.18 mm on an 85.6 × 54 mm card */
		border-radius: 3.7% / 5.9%;
		overflow: hidden;
		background: white;
		box-shadow:
			0 0 0 1px rgb(15 34 51 / 0.08),
			0 30px 60px -30px rgb(15 34 51 / 0.45),
			0 12px 20px -14px rgb(15 34 51 / 0.3);
	}
	.face {
		height: 100%;
		clip-path: inset(0 100% 0 0);
		animation: print 1.15s var(--ease-in-out) 0.3s forwards;
	}
	@keyframes print {
		to {
			clip-path: inset(0 0 0 0);
		}
	}
	/* Print head travels with the edge of the printed area */
	.track {
		position: absolute;
		inset: -7% 0;
		pointer-events: none;
		animation: travel 1.15s var(--ease-in-out) 0.3s both;
	}
	@keyframes travel {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(100%);
		}
	}
	.head {
		position: absolute;
		top: 0;
		bottom: 0;
		left: -9px;
		display: flex;
		gap: 0;
		width: 18px;
		padding: 0 3px;
		border-radius: 4px;
		background: var(--color-ink);
		box-shadow: 0 6px 14px -4px rgb(15 34 51 / 0.5);
		animation: head-out 300ms var(--ease-out) 1.45s forwards;
	}
	.head i {
		flex: 1;
		margin-block: 6px;
	}
	.head i:nth-child(1) {
		background: var(--color-yellow);
	}
	.head i:nth-child(2) {
		background: #c2185b;
	}
	.head i:nth-child(3) {
		background: #0a8fc0;
	}
	.head i:nth-child(4) {
		background: #5d6b78;
	}
	@keyframes head-out {
		to {
			opacity: 0;
			transform: scaleY(0.6);
		}
	}
	/* The "O" panel: clear overlay laminate sweeping across */
	.gloss {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			105deg,
			transparent 38%,
			rgb(255 255 255 / 0.55) 50%,
			transparent 62%
		);
		background-size: 260% 100%;
		background-position: 130% 0;
		animation: gloss 1s var(--ease-in-out) 1.55s forwards;
		pointer-events: none;
		mix-blend-mode: soft-light;
	}
	@keyframes gloss {
		to {
			background-position: -30% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.face {
			clip-path: none;
			animation: none;
		}
		.track,
		.gloss {
			display: none;
		}
		.card-wrap,
		.copy {
			animation: none;
		}
	}
</style>
