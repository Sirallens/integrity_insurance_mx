<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    translations: Record<string, string>;
  }

  let { translations: t }: Props = $props();

  // --- State ---
  type FormStatus = "idle" | "submitting" | "success" | "error";

  let status = $state<FormStatus>("idle");
  let errorMsg = $state("");
  let fieldErrors = $state<Record<string, string>>({});

  let formData = $state({
    name: "",
    email: "",
    phone: "",
    policy: "",
    topic: "General Inquiry",
    message: "",
  });

  // Honeypot value — should always remain empty
  let honeypot = $state("");

  // --- Validation ---
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(field: string): string {
    switch (field) {
      case "name":
        if (!formData.name.trim()) return t.errRequired;
        if (formData.name.trim().length < 2) return t.errNameMin;
        return "";
      case "email":
        if (!formData.email.trim()) return t.errRequired;
        if (!EMAIL_RE.test(formData.email.trim())) return t.errEmail;
        return "";
      case "message":
        if (!formData.message.trim()) return t.errRequired;
        if (formData.message.trim().length < 10) return t.errMsgMin;
        return "";
      default:
        return "";
    }
  }

  function validateAll(): boolean {
    const fields = ["name", "email", "message"];
    let valid = true;
    const errors: Record<string, string> = {};

    for (const f of fields) {
      const err = validateField(f);
      if (err) {
        errors[f] = err;
        valid = false;
      }
    }

    fieldErrors = errors;
    return valid;
  }

  function handleBlur(field: string) {
    const err = validateField(field);
    if (err) {
      fieldErrors = { ...fieldErrors, [field]: err };
    } else {
      const next = { ...fieldErrors };
      delete next[field];
      fieldErrors = next;
    }
  }

  // --- Submission ---
  async function handleSubmit(e: Event) {
    e.preventDefault();

    // Honeypot check — silent abort
    if (honeypot) return;

    // Validate
    if (!validateAll()) {
      // Focus first error field
      const firstErr = ["name", "email", "message"].find((f) => fieldErrors[f]);
      if (firstErr) {
        const el = document.getElementById(`contact-${firstErr}`);
        el?.focus();
      }
      return;
    }

    status = "submitting";
    errorMsg = "";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        policy: formData.policy.trim(),
        topic: formData.topic,
        message: formData.message.trim(),
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        status = "success";
      } else {
        status = "error";
        errorMsg = t.errorGeneral;
      }
    } catch (err) {
      status = "error";
      if (err instanceof DOMException && err.name === "AbortError") {
        errorMsg = t.errorTimeout;
      } else {
        errorMsg = t.errorGeneral;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  function resetForm() {
    formData = {
      name: "",
      email: "",
      phone: "",
      policy: "",
      topic: "General Inquiry",
      message: "",
    };
    fieldErrors = {};
    errorMsg = "";
    status = "idle";
  }

  // --- Derived ---
  let isSubmitting = $derived(status === "submitting");

  // Shared input class
  const inputClass =
    "w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400";
  const labelClass =
    "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
  const errorClass = "text-xs text-red-500 dark:text-red-400 mt-1";
</script>

<div
  class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 lg:p-10 relative"
>
  {#if status === "success"}
    <!-- Success State -->
    <div class="text-center py-8" aria-live="polite">
      <div
        class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <span class="material-icons text-green-600 dark:text-green-400 text-3xl"
          >check_circle</span
        >
      </div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {t.successTitle}
      </h2>
      <p class="text-slate-500 dark:text-slate-400 mb-6">
        {t.successBody}
      </p>
      <button
        type="button"
        onclick={resetForm}
        class="text-primary hover:underline font-semibold"
      >
        {t.sendAnother}
      </button>
    </div>
  {:else}
    <!-- Form Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {t.title}
      </h2>
      <p class="text-slate-500 dark:text-slate-400">
        {t.subtitle}
      </p>
    </div>

    <form
      onsubmit={handleSubmit}
      class="space-y-6"
      class:opacity-50={isSubmitting}
      novalidate
    >
      <!-- Honeypot — invisible to humans, attractive to bots -->
      <div
        aria-hidden="true"
        style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"
      >
        <label for="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabindex={-1}
          autocomplete="off"
          bind:value={honeypot}
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name -->
        <div>
          <label class={labelClass} for="contact-name">{t.name}</label>
          <input
            class={inputClass}
            class:border-red-500={fieldErrors.name}
            id="contact-name"
            name="name"
            type="text"
            autocomplete="name"
            maxlength={80}
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "err-name" : undefined}
            bind:value={formData.name}
            onblur={() => handleBlur("name")}
            disabled={isSubmitting}
          />
          {#if fieldErrors.name}
            <p id="err-name" class={errorClass} role="alert">
              {fieldErrors.name}
            </p>
          {/if}
        </div>

        <!-- Email -->
        <div>
          <label class={labelClass} for="contact-email">{t.email}</label>
          <input
            class={inputClass}
            class:border-red-500={fieldErrors.email}
            id="contact-email"
            name="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            maxlength={254}
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "err-email" : undefined}
            bind:value={formData.email}
            onblur={() => handleBlur("email")}
            disabled={isSubmitting}
          />
          {#if fieldErrors.email}
            <p id="err-email" class={errorClass} role="alert">
              {fieldErrors.email}
            </p>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Phone -->
        <div>
          <label class={labelClass} for="contact-phone">{t.phone}</label>
          <input
            class={inputClass}
            id="contact-phone"
            name="phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            maxlength={20}
            bind:value={formData.phone}
            disabled={isSubmitting}
          />
        </div>

        <!-- Policy Number -->
        <div>
          <label class={labelClass} for="contact-policy">
            {t.policy}
            <span class="text-slate-400 font-normal">{t.policyHint}</span>
          </label>
          <input
            class={inputClass}
            id="contact-policy"
            name="policy"
            type="text"
            autocomplete="off"
            maxlength={30}
            bind:value={formData.policy}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <!-- Topic -->
      <div>
        <label class={labelClass} for="contact-topic">{t.topic}</label>
        <select
          class="{inputClass} bg-white"
          id="contact-topic"
          name="topic"
          bind:value={formData.topic}
          disabled={isSubmitting}
        >
          <option>{t.topicGeneral}</option>
          <option>{t.topicCoverage}</option>
          <option>{t.topicModify}</option>
          <option>{t.topicClaims}</option>
          <option>{t.topicOther}</option>
        </select>
      </div>

      <!-- Message -->
      <div>
        <label class={labelClass} for="contact-message">{t.message}</label>
        <textarea
          class={inputClass}
          class:border-red-500={fieldErrors.message}
          id="contact-message"
          name="message"
          rows="4"
          maxlength={2000}
          required
          aria-required="true"
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "err-message" : undefined}
          placeholder={t.messagePlaceholder}
          bind:value={formData.message}
          onblur={() => handleBlur("message")}
          disabled={isSubmitting}
        ></textarea>
        {#if fieldErrors.message}
          <p id="err-message" class={errorClass} role="alert">
            {fieldErrors.message}
          </p>
        {/if}
      </div>

      <!-- Submit -->
      <div class="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full md:w-auto bg-primary hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/30 transform transition hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center md:justify-start gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {#if isSubmitting}
            <svg
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span>{t.submitting}</span>
          {:else}
            <span>{t.submit}</span>
            <span class="material-icons text-sm">arrow_forward</span>
          {/if}
        </button>
      </div>

      <!-- Error Banner -->
      {#if status === "error" && errorMsg}
        <div
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm"
          role="alert"
          aria-live="polite"
        >
          {errorMsg}
        </div>
      {/if}
    </form>
  {/if}
</div>
