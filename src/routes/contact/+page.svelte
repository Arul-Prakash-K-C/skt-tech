<script lang="ts">
	import Seo from '$lib/components/ui/Seo.svelte';
	import Breadcrumbs from '$lib/components/ui/Breadcrumbs.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import { phoneHref } from '$lib/utils/format';

	let { data, form } = $props();

	const s = $derived(data.settings);

	const NEXT = [
		'We read every enquiry the same working day.',
		'You get options and a quote by email, or a call if you prefer.',
		'If it helps, we print sample cards on the printers you are considering.'
	];
</script>

<Seo
	title="Contact us"
	description="Ask for a quote, book a demo or arrange service for your ID card printer. We reply within one working day."
/>

<div class="shell pt-6 pb-16 md:pt-8 md:pb-24">
	<Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />

	<div class="mt-8 grid gap-12 md:mt-12 lg:grid-cols-12 lg:gap-16">
		<div class="lg:col-span-5">
			<h1 class="h1">Talk to our team</h1>
			<p class="lede mt-4">
				Quotes, demos, consumables or service. Tell us what you need and we’ll come back within one
				working day.
			</p>

			<ul class="mt-10 grid gap-5">
				{#if s.phone}
					<li>
						<a href="tel:{phoneHref(s.phone)}" class="contact group">
							<span class="ic"><Icon name="phone" size={20} /></span>
							<span><span class="k">Call</span><span class="v num">{s.phone}</span></span>
						</a>
					</li>
				{/if}
				{#if s.whatsapp}
					<li>
						<a
							href="https://wa.me/{phoneHref(s.whatsapp).replace('+', '')}"
							target="_blank"
							rel="noopener noreferrer"
							class="contact group"
						>
							<span class="ic"><Icon name="whatsapp" size={20} /></span>
							<span><span class="k">WhatsApp</span><span class="v num">{s.whatsapp}</span></span>
						</a>
					</li>
				{/if}
				{#if s.email}
					<li>
						<a href="mailto:{s.email}" class="contact group">
							<span class="ic"><Icon name="mail" size={20} /></span>
							<span><span class="k">Email</span><span class="v">{s.email}</span></span>
						</a>
					</li>
				{/if}
				{#if s.address}
					<li>
						<svelte:element
							this={s.mapUrl ? 'a' : 'div'}
							href={s.mapUrl}
							target={s.mapUrl ? '_blank' : undefined}
							rel={s.mapUrl ? 'noopener noreferrer' : undefined}
							class="contact group"
						>
							<span class="ic"><Icon name="pin" size={20} /></span>
							<span>
								<span class="k">Visit</span>
								<span class="v">{s.address}</span>
								{#if s.hours}<span class="mt-1 block text-sm text-muted">{s.hours}</span>{/if}
							</span>
						</svelte:element>
					</li>
				{/if}
			</ul>

			<div class="mt-12 border-t border-line pt-8">
				<h2 class="text-[0.9375rem] font-semibold">What happens next</h2>
				<ol class="mt-4 grid gap-3">
					{#each NEXT as step, i (step)}
						<li class="flex gap-3 text-ink-2">
							<span
								class="num grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-xs font-semibold"
								>{i + 1}</span
							>
							{step}
						</li>
					{/each}
				</ol>
			</div>
		</div>

		<div class="lg:col-span-7">
			<div class="rounded-lg border border-line bg-stock p-6 shadow-lift sm:p-8 md:p-10">
				<ContactForm
					{form}
					token={data.token}
					product={data.product}
					prefillSubject={data.prefillSubject}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.contact {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}
	.ic {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--radius-sm);
		background: var(--color-stock);
		border: 1px solid var(--color-line);
		color: var(--color-cyan);
		transition:
			background-color var(--dur-2) var(--ease-out),
			color var(--dur-2) var(--ease-out);
	}
	a.contact:hover .ic {
		background: var(--color-cyan);
		color: white;
	}
	.k {
		display: block;
		font-size: 0.8125rem;
		color: var(--color-muted);
	}
	.v {
		display: block;
		font-weight: 560;
		color: var(--color-ink);
	}
</style>
