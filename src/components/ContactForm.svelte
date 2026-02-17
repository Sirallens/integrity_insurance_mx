<script lang="ts">
    let formData = $state({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    let isSubmitting = $state(false);
    let submitStatus = $state<"idle" | "success" | "error">("idle");

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isSubmitting = true;

        try {
            // TODO: Replace with your Laravel/Rails backend endpoint
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                submitStatus = "success";
                formData = { name: "", email: "", phone: "", message: "" };
            } else {
                submitStatus = "error";
            }
        } catch (error) {
            console.error("Form submission error:", error);
            submitStatus = "error";
        } finally {
            isSubmitting = false;
            setTimeout(() => {
                submitStatus = "idle";
            }, 5000);
        }
    }
</script>

<div
    class="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800"
>
    <h2
        class="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6"
    >
        Request a Consultation
    </h2>

    <form onsubmit={handleSubmit} class="space-y-6">
        <!-- Name Field -->
        <div>
            <label
                for="name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Full Name *
            </label>
            <input
                type="text"
                id="name"
                bind:value={formData.name}
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                placeholder="John Doe"
            />
        </div>

        <!-- Email Field -->
        <div>
            <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Email Address *
            </label>
            <input
                type="email"
                id="email"
                bind:value={formData.email}
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                placeholder="john@example.com"
            />
        </div>

        <!-- Phone Field -->
        <div>
            <label
                for="phone"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Phone Number
            </label>
            <input
                type="tel"
                id="phone"
                bind:value={formData.phone}
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                placeholder="+52 555 123 4567"
            />
        </div>

        <!-- Message Field -->
        <div>
            <label
                for="message"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Message *
            </label>
            <textarea
                id="message"
                bind:value={formData.message}
                required
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-dark text-gray-900 dark:text-white resize-none"
                placeholder="Tell us about your insurance needs..."
            ></textarea>
        </div>

        <!-- Submit Button -->
        <button
            type="submit"
            disabled={isSubmitting}
            class="w-full bg-secondary hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSubmitting ? "Sending..." : "Send Message"}
        </button>

        <!-- Status Messages -->
        {#if submitStatus === "success"}
            <div
                class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
            >
                Thank you! Your message has been sent successfully.
            </div>
        {/if}

        {#if submitStatus === "error"}
            <div
                class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200"
            >
                Something went wrong. Please try again or contact us directly.
            </div>
        {/if}
    </form>

    <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Note: The backend API endpoint needs to be configured. Update the fetch
        URL in ContactForm.svelte.
    </p>
</div>
