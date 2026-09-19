<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { ValueItem } from '$lib/sanity/types';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import { trackScroll } from '$lib/utils/scroll-fx';

	/**
	 * "From first call to first card", told by printing a card as you scroll.
	 *
	 * The section is tall and its content pinned; scroll progress p (0–1)
	 * drives five print passes, like a dye-sub printer: yellow, magenta, cyan,
	 * black, then the holographic overlay. The inks are multiplied, so they mix
	 * on the card the way real ink does. The step matching the progress is the
	 * active one. Reduced motion (or no JS) shows the finished card and every
	 * step, with no pinning.
	 */

	interface Props {
		title: string;
		steps: ValueItem[];
	}

	let { title, steps }: Props = $props();

	const PASSES = [
		{ key: 'y', ink: 'var(--color-process-yellow)' },
		{ key: 'm', ink: 'var(--color-process-magenta)' },
		{ key: 'c', ink: 'var(--color-process-cyan)' },
		{ key: 'k', ink: 'var(--color-ink)' },
		{ key: 'o', ink: 'linear-gradient(90deg,#00d4ff,#8b5cf6,#ff3fa4,#ffd100,#3ee6c1)' }
	] as const;

	let active = $state(0);
	let pass = $state(-1);
	let live = $state(false);

	const track: Attachment<HTMLElement> = (section) => {
		if (prefersReducedMotion()) return;
		live = true;
		const n = steps.length;

		const update = (p: number) => {
			section.style.setProperty('--p', p.toFixed(4));
			// Printing runs across the middle 84% of the scroll, so the finished
			// card holds for a moment at the end
			const t = Math.min(1, Math.max(0, (p - 0.04) / 0.84)) * PASSES.length;
			PASSES.forEach((ps, i) => {
				section.style.setProperty(`--${ps.key}`, Math.min(1, Math.max(0, t - i)).toFixed(4));
			});
			const current = t >= PASSES.length ? -1 : Math.floor(t);
			section.style.setProperty('--head', (t - Math.floor(t)).toFixed(4));
			if (current !== pass) pass = current;
			const step = Math.min(n - 1, Math.floor(p * n));
			if (step !== active) active = step;
		};
		// 0 when the section's top reaches the viewport top, 1 when its bottom
		// reaches the viewport bottom: exactly the pinned stretch
		const stop = trackScroll(section, [0, 0], [1, 1], update);
		return () => {
			stop();
			live = false;
		};
	};
</script>

<section
	class={['process', live && 'live']}
	style:--n={steps.length}
	aria-labelledby="process"
	{@attach track}
>
	<div class="pin">
		<div class="shell grid h-full content-center gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
			<div class="lg:col-span-5">
				<h2 id="process" class="h2">{title}</h2>
				<!-- A real sequence, so it is numbered -->
				<ol class="steps mt-6 md:mt-10">
					{#each steps as step, i (step._key)}
						<li
							class="step"
							data-state={!live ? 'open' : i === active ? 'open' : i < active ? 'done' : 'todo'}
							aria-current={live && i === active ? 'step' : undefined}
						>
							<span class="n num" aria-hidden="true">{i + 1}</span>
							<div class="min-w-0">
								<h3 class="step-title">{step.title}</h3>
								{#if step.text}
									<div class="step-body">
										<p class="overflow-hidden text-ink-2">{step.text}</p>
									</div>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			</div>

			<div class="order-first lg:order-none lg:col-span-6 lg:col-start-7" aria-hidden="true">
				<div class="stage">
					<div class="card">
						<!-- Each ink is its own layer, laid down left to right by the head -->
						<svg class="ink y" viewBox="0 0 856 540" preserveAspectRatio="none">
							<rect y="150" width="856" height="18" fill="#ffd100" />
							<rect x="56" y="206" width="206" height="262" rx="18" fill="#ffd100" opacity=".32" />
							<rect x="630" y="222" width="170" height="34" rx="7" fill="#ffd100" opacity=".7" />
						</svg>
						<svg class="ink m" viewBox="0 0 856 540" preserveAspectRatio="none">
							<rect width="856" height="150" fill="#e4007c" />
							<rect x="56" y="206" width="206" height="262" rx="18" fill="#e4007c" opacity=".14" />
							<rect x="630" y="222" width="170" height="34" rx="7" fill="#e4007c" opacity=".55" />
						</svg>
						<svg class="ink c" viewBox="0 0 856 540" preserveAspectRatio="none">
							<rect width="856" height="150" fill="#00a3e0" />
							<circle cx="159" cy="300" r="52" fill="#00a3e0" opacity=".55" />
							<path d="M78 468c6-78 44-112 81-112s75 34 81 112z" fill="#00a3e0" opacity=".55" />
							<rect x="300" y="480" width="500" height="22" rx="6" fill="#00a3e0" opacity=".35" />
						</svg>
						<svg class="ink k" viewBox="0 0 856 540" preserveAspectRatio="none">
							<rect x="170" y="52" width="250" height="26" rx="6" fill="#fff" opacity=".92" />
							<rect x="170" y="92" width="160" height="14" rx="5" fill="#fff" opacity=".6" />
							<rect x="300" y="222" width="300" height="34" rx="7" fill="#0f2233" />
							<circle cx="92" cy="75" r="40" fill="#fff" />
							<path d="M92 50l24 42H68z" fill="#e4007c" />
							<circle cx="92" cy="78" r="9" fill="#ffd100" />
							<rect x="300" y="274" width="200" height="16" rx="5" fill="#0f2233" opacity=".55" />
							<rect x="300" y="330" width="120" height="12" rx="4" fill="#0f2233" opacity=".4" />
							<rect x="300" y="350" width="180" height="22" rx="5" fill="#0f2233" />
							<g fill="#0f2233">
								{#each [0, 7, 11, 20, 24, 31, 38, 42, 50, 55, 62, 66, 74, 80, 86, 93, 99, 106, 110, 118, 124, 130, 137, 142, 150, 156, 163, 168, 176, 182, 189, 196, 202, 208, 214, 222, 228] as x, i (i)}
									<rect x={560 + x} y="330" width={i % 3 === 0 ? 4 : 2.5} height="96" />
								{/each}
							</g>
						</svg>
						<div class="ink o"></div>

						<!-- The print head, carrying the colour of the current pass -->
						{#if pass >= 0}
							<span class="head" style:--ink={PASSES[pass].ink}></span>
						{/if}
					</div>

					<!-- The ribbon: which panel is printing -->
					<ol class="ribbon">
						{#each PASSES as ps, i (ps.key)}
							<li
								style:--ink={ps.ink}
								data-state={!live || pass === -1 || i < pass ? 'done' : i === pass ? 'now' : 'todo'}
							></li>
						{/each}
					</ol>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Static / reduced-motion defaults: finished card, every step open */
	.process {
		--p: 1;
		--y: 1;
		--m: 1;
		--c: 1;
		--k: 1;
		--o: 1;
		--head: 0;
		padding-block: 4rem;
	}
	/* Live: tall section, pinned content */
	.process.live {
		height: calc(var(--n) * 55vh + 100svh);
		padding-block: 0;
	}
	.live .pin {
		position: sticky;
		top: var(--header-h);
		height: calc(100svh - var(--header-h));
		padding-block: 1.5rem;
	}

	.steps {
		position: relative;
		display: grid;
		gap: 0.25rem;
	}
	/* The rail between the numbers fills as the scroll progresses */
	.live .steps::before,
	.live .steps::after {
		content: '';
		position: absolute;
		left: calc(1.125rem - 1px);
		top: 1.25rem;
		bottom: 1.25rem;
		width: 2px;
		border-radius: 2px;
		background: var(--color-line);
	}
	.live .steps::after {
		background: var(--color-ink);
		transform-origin: top;
		transform: scaleY(var(--p));
	}
	.step {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 2.25rem 1fr;
		gap: 1rem;
		padding-block: 0.5rem;
	}
	.n {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		border: 1.5px solid var(--color-line-strong);
		background: var(--color-paper);
		font-size: 0.875rem;
		font-weight: 620;
		color: var(--color-muted);
		transition:
			background-color var(--dur-3) var(--ease-out),
			border-color var(--dur-3) var(--ease-out),
			color var(--dur-3) var(--ease-out),
			transform var(--dur-3) var(--ease-spring);
	}
	.step[data-state='open'] .n {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: white;
		transform: scale(1.08);
	}
	.step[data-state='done'] .n {
		border-color: var(--color-ink);
		color: var(--color-ink);
	}
	.step-title {
		padding-top: 0.25rem;
		font-size: clamp(1.0625rem, 1rem + 0.4vw, 1.3125rem);
		font-weight: 600;
		font-variation-settings: 'wdth' 106;
		line-height: 1.25;
		color: var(--color-subtle);
		transition: color var(--dur-3) var(--ease-out);
	}
	.step[data-state='open'] .step-title,
	.step[data-state='done'] .step-title {
		color: var(--color-ink);
	}
	/* Only the active step's text is open; the rows animate their height */
	.step-body {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows var(--dur-4) var(--ease-out),
			opacity var(--dur-3) var(--ease-out);
	}
	.step[data-state='open'] .step-body {
		grid-template-rows: 1fr;
		opacity: 1;
	}
	.step-body p {
		padding-top: 0.375rem;
	}

	/* ---- The card being printed ----------------------------------------- */
	.stage {
		width: min(100%, 34rem);
		margin-inline: auto;
		perspective: 1200px;
	}
	.live .stage {
		width: min(100%, 34rem, 44svh * 1.586);
	}
	.card {
		position: relative;
		aspect-ratio: 1.586;
		border-radius: 3.7% / 5.9%;
		overflow: hidden;
		background: #fff;
		box-shadow:
			0 0 0 1px rgb(15 34 51 / 0.08),
			0 calc(10px + var(--o) * 30px) calc(24px + var(--o) * 40px) -20px rgb(15 34 51 / 0.45);
		/* The card rides out of the printer as it is printed, then settles */
		transform: rotateX(calc((1 - var(--p)) * 22deg)) translateY(calc((1 - var(--p)) * 6%));
	}
	.ink {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		mix-blend-mode: multiply;
	}
	.y {
		clip-path: inset(0 calc((1 - var(--y)) * 100%) 0 0);
	}
	.m {
		clip-path: inset(0 calc((1 - var(--m)) * 100%) 0 0);
	}
	.c {
		clip-path: inset(0 calc((1 - var(--c)) * 100%) 0 0);
	}
	.k {
		mix-blend-mode: normal;
		clip-path: inset(0 calc((1 - var(--k)) * 100%) 0 0);
	}
	/* Holographic overlay laminate, the last pass */
	.o {
		mix-blend-mode: color-dodge;
		opacity: 0.4;
		background: linear-gradient(
			115deg,
			transparent 18%,
			#00d4ff 30%,
			#8b5cf6 38%,
			#ff3fa4 46%,
			#ffd100 54%,
			#3ee6c1 62%,
			transparent 76%
		);
		background-size: 240% 240%;
		background-position: calc(20% + var(--p) * 60%) 50%;
		-webkit-mask-image: repeating-linear-gradient(60deg, #000 0 1px, transparent 1px 4px);
		mask-image: repeating-linear-gradient(60deg, #000 0 1px, transparent 1px 4px);
		clip-path: inset(0 calc((1 - var(--o)) * 100%) 0 0);
	}
	.head {
		position: absolute;
		top: -4%;
		bottom: -4%;
		left: calc(var(--head) * 100%);
		width: 10px;
		margin-left: -5px;
		border-radius: 5px;
		background: var(--ink);
		box-shadow:
			0 0 0 2px rgb(255 255 255 / 0.9),
			0 0 24px 4px rgb(15 34 51 / 0.25);
	}

	.ribbon {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.75rem;
	}
	.ribbon li {
		width: 2.25rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--ink);
		opacity: 0.25;
		transition:
			opacity var(--dur-3) var(--ease-out),
			width var(--dur-3) var(--ease-spring);
	}
	.ribbon li[data-state='done'] {
		opacity: 1;
	}
	.ribbon li[data-state='now'] {
		opacity: 1;
		width: 3.5rem;
	}

	/* Short screens: keep the pinned view inside the viewport */
	@media (max-width: 1023px) {
		.live .stage {
			width: min(100%, 22rem, 30svh * 1.586);
		}
		.live .step {
			padding-block: 0.25rem;
		}
		.ribbon {
			margin-top: 1rem;
		}
	}
</style>
