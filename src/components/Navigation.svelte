<script lang="ts">
  import { onMount } from "svelte";

  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  onMount(() => {
    // Dark mode is disabled by default
    // Uncomment to enable:
    // const savedTheme = localStorage.getItem('theme');
    // isDarkMode = savedTheme === 'dark';
  });
</script>

<nav
  class="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-800"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-20 items-center">
      <!-- Logo -->
      <div class="flex-shrink-0 flex items-center gap-2">
        <a href="/" class="flex items-center gap-2">
          <div class="h-10 w-10 relative">
            <img
              alt="Integrity Agente de Seguros Logo"
              class="h-full w-full object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqNRXOfCY-LgbKHF9NrDuFhTCFwuwyni4xhZbvO9RKclNDiBAT7Nop_C-gs1Rtkp15kLOp9iuHtoMn79H8P7gEYPay-77wwVHKkiN7iU-l84ocbuluxg65KIVTC2H1FrqljbdsozSb_06FvcAUUXM5Z6pH9XulmV6IcRTCNsOaNicZ_3_s9nFhVZBoyHUCf7oTsTGgqUxtvZEYHhYjxz_RFjAqZkFOlgCENxDUMTk58Qi3Rt58pB46FTcr6xS4TI4R9zo5tkrNTOpj"
            />
          </div>
          <span
            class="font-display font-bold text-xl text-primary tracking-wide hidden sm:block"
          >
            INTEGRITY
          </span>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex space-x-8 items-center">
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href="/how-it-works"
        >
          How it works
        </a>
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href="/why-insurance"
        >
          Why Insurance
        </a>
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href="/coverage-options"
        >
          Coverage options
        </a>
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href="/faq"
        >
          FAQ
        </a>
        <a
          class="bg-secondary hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          href="/contact"
        >
          Request Consultation
        </a>

        <!-- Dark Mode Toggle (Hidden by default - uncomment to enable) -->
        <!-- <button
          onclick={toggleDarkMode}
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          <span class="material-icons-outlined text-gray-500 dark:text-gray-400">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button> -->
      </div>

      <!-- Mobile Menu Button -->
      <div class="flex items-center md:hidden">
        <button
          onclick={toggleMenu}
          class="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
          type="button"
          aria-label="Toggle menu"
        >
          <span class="material-icons-outlined text-3xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    {#if isMenuOpen}
      <div class="md:hidden pb-4">
        <div class="flex flex-col space-y-3">
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href="/why-insurance"
          >
            Why Insurance
          </a>
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href="/faq"
          >
            FAQ
          </a>
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href="/how-it-works"
          >
            How it works
          </a>
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href="/coverage-options"
          >
            Coverage options
          </a>
          <a
            class="bg-secondary hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all text-center"
            href="/contact"
          >
            Request Consultation
          </a>
        </div>
      </div>
    {/if}
  </div>
</nav>
