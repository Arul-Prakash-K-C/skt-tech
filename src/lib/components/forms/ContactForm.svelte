<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Field from './Field.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	type FieldName = 'name' | 'email' | 'phone' | 'company' | 'subject' | 'message' | 'product';
	type Values = Partial<Record<FieldName, string>>;
	type ActionData =
		| { success: boolean; values?: undefined; errors?: undefined; message?: undefined }
		| { values?: Values; errors?: Values; message?: string; success?: undefined }
		| null
		| undefined;

	interface Props {
		form: ActionData;
		token: string;
		product?: { name: string; slug: string };
		prefillSubject?: string;
	}

	let { form, token, product, prefillSubject = '' }: Props = $props();

	let pending = $state(false);
	let formEl: HTMLFormElement | undefined = $state();

	const failed = $derived(form && !form.success ? form : undefined);
	const values = $derived<Values>(failed?.values ?? {});
	const errors = $derived<Values>(failed?.errors ?? {});
	const sent = $derived(!!form?.success);

	const submit: SubmitFunction = () => {
		pending = true;
		return async ({ update, result }) => {
			await update({ reset: result.type === 'success' });
			pending = false;
			await tick();
			// Move focus to the first problem, or to the confirmation
			const target =
				formEl?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
				document.getElementById('enquiry-status');
			target?.focus();
		};
	};

	const SUBJECTS = [
		'Quote request',
		'Printer service or repair',
		'Reorder ribbons or cards',
		'Custom card printing',
		'Book a demo'
	];
</script>

{#if sent}
	<div id="enquiry-status" class="sent" tabindex="-1" role="status">
		<svg class="stamp" viewBox="0 0 64 42" aria-hidden="true">
			<rect
				x="1"
				y="1"
				width="62"
				height="40"
				rx="5"
				fill="white"
				stroke="currentColor"
				stroke-width="2"
			/>
			<path
				class="tick"
				d="M21 21.5l7 7 15-15"
				fill="none"
				stroke="var(--color-ok)"
				stroke-width="3.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<h2 class="h3 mt-6">Enquiry sent</h2>
		<p class="mt-2 max-w-md text-muted">
			Thank you. Someone from our sales team will reply by email or phone, usually within one
			working day.
		</p>
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<Button href="/products" variant="secondary">Keep browsing</Button>
		</div>
	</div>
{:else}
	<form method="POST" bind:this={formEl} use:enhance={submit} novalidate class="grid gap-5">
		{#if failed?.message}
			<div id="enquiry-status" class="banner" role="alert" tabindex="-1">
				<Icon name="alert" size={18} class="mt-0.5" />
				<p>{failed.message}</p>
			</div>
		{:else if Object.keys(errors).length}
			<p class="banner" role="alert">
				<Icon name="alert" size={18} class="mt-0.5" />
				Please check the highlighted {Object.keys(errors).length === 1 ? 'field' : 'fields'}.
			</p>
		{/if}

		<input type="hidden" name="token" value={token} />
		{#if product}<input type="hidden" name="product" value={product.slug} />{/if}
		<!-- Honeypot: hidden from people and assistive tech -->
		<div class="hp" aria-hidden="true">
			<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
		</div>

		{#if product}
			<div
				class="flex items-center gap-3 rounded-sm bg-cyan-soft px-4 py-3 text-sm text-cyan-strong"
			>
				<Icon name="check" size={16} />
				<span
					>Enquiring about <a
						href="/products/{product.slug}"
						class="font-semibold underline underline-offset-2">{product.name}</a
					></span
				>
			</div>
		{/if}

		<div class="grid gap-5 sm:grid-cols-2">
			<Field
				label="Your name"
				name="name"
				autocomplete="name"
				required
				value={values.name ?? ''}
				error={errors.name}
			/>
			<Field
				label="Company or institution"
				name="company"
				autocomplete="organization"
				optional
				value={values.company ?? ''}
				error={errors.company}
			/>
			<Field
				label="Email"
				name="email"
				type="email"
				autocomplete="email"
				inputmode="email"
				required
				value={values.email ?? ''}
				error={errors.email}
			/>
			<Field
				label="Phone"
				name="phone"
				type="tel"
				autocomplete="tel"
				inputmode="tel"
				optional
				placeholder="+91"
				value={values.phone ?? ''}
				error={errors.phone}
			/>
		</div>

		<Field
			label="Subject"
			name="subject"
			required
			list="subjects"
			value={values.subject ?? prefillSubject}
			error={errors.subject}
		/>
		<datalist id="subjects">
			{#each SUBJECTS as s (s)}<option value={s}></option>{/each}
		</datalist>

		<Field
			label="Message"
			name="message"
			multiline
			required
			rows={6}
			maxlength={3000}
			value={values.message ?? ''}
			error={errors.message}
			hint="Quantities, card types and your location help us quote accurately."
		/>

		<div class="flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-xs text-muted">We only use your details to reply to this enquiry.</p>
			<Button type="submit" size="lg" disabled={pending} aria-disabled={pending}>
				{#if pending}
					<span class="spinner" aria-hidden="true"></span>Sending…
				{:else}
					Send enquiry
				{/if}
			</Button>
		</div>
	</form>
{/if}

<style>
	.hp {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
	.banner {
		display: flex;
		gap: 0.625rem;
		padding: 0.875rem 1rem;
		border-radius: var(--radius-sm);
		background: var(--color-magenta-soft);
		color: var(--color-magenta);
		font-size: 0.9375rem;
	}
	.spinner {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		border: 2px solid rgb(255 255 255 / 0.35);
		border-top-color: white;
		animation: spin 700ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}
	.sent {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 1rem;
		text-align: center;
		outline: none;
	}
	.stamp {
		width: 5.5rem;
		color: var(--color-line-strong);
		animation: drop 600ms var(--ease-spring) both;
	}
	.tick {
		stroke-dasharray: 40;
		stroke-dashoffset: 40;
		animation: draw 500ms var(--ease-out) 350ms forwards;
	}
	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-12px) rotate(-6deg);
		}
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
