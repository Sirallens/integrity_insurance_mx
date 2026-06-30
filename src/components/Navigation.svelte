<script lang="ts">
  import { onMount } from "svelte";
  import { useTranslations, getRelativeLocaleUrl } from "../i18n/utils";
  import type { ui } from "../i18n/ui";

  let { lang = "en" }: { lang?: keyof typeof ui } = $props();

  let t = $derived(useTranslations(lang));

  // Create relative URL helper
  let l = $derived((path: string) => getRelativeLocaleUrl(lang, path));

  let isMenuOpen = $state(false);
  let isDarkMode = $state(false);
  let isLangOpen = $state(false);
  let currentPath = $state("/");

  // Derived URLs for language switching
  let enHref = $derived(currentPath);
  let esHref = $derived(currentPath === "/" ? "/es/" : `/es${currentPath}`);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function toggleLang(e: Event) {
    e.stopPropagation();
    isLangOpen = !isLangOpen;
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
    // Compute current path without locale prefix
    const path = window.location.pathname;
    const clean = path.replace(/^\/es(\/|$)/, "/");
    currentPath = clean || "/";

    // Close language dropdown on click outside
    const handleClickOutside = () => { isLangOpen = false; };
    document.addEventListener("click", handleClickOutside);

    // Dark mode is disabled by default
    // Uncomment to enable:
    // const savedTheme = localStorage.getItem('theme');
    // isDarkMode = savedTheme === 'dark';

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<nav
  class="sticky top-0 z-50 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-800"
>
  <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-20 items-center">
      <!-- Logo -->
      <div class="flex-shrink-0 flex items-center gap-2">
        <a href="/" class="flex items-center gap-2">
          <div class="h-20 w-60 relative">
            <img
              alt="Integrity Agente de Seguros Logo"
              class="h-full w-full object-contain"
              src="/images/integrity-logoHorizontal.png"
            />
          </div>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex space-x-8 items-center">
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href={l("/how-it-works")}
        >
          {t("nav.howItWorks")}
        </a>
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href={l("/why-insurance")}
        >
          {t("nav.whyInsurance")}
        </a>
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href={l("/coverage-options")}
        >
          {t("nav.coverageOptions")}
        </a>
        <a
          class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors"
          href={l("/faq")}
        >
          {t("nav.faq")}
        </a>
        <a
          class="bg-secondary hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          href={l("/contact")}
        >
          {t("nav.consultation")}
        </a>

        <!-- Language Switcher -->
        <div class="relative ml-4">
          <button
            onclick={toggleLang}
            class="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition-colors"
          >
            {lang.toUpperCase()}
            <span
              class="material-icons-outlined text-sm transition-transform duration-200"
              class:rotate-180={isLangOpen}
            >expand_more</span>
          </button>
          {#if isLangOpen}
            <div
              class="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in-up"
            >
              <a
                href={enHref}
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition-colors {lang ===
                'en'
                  ? 'font-bold text-primary'
                  : ''}">English</a
              >
              <a
                href={esHref}
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary transition-colors {lang ===
                'es'
                  ? 'font-bold text-primary'
                  : ''}">Español</a
              >
            </div>
          {/if}
        </div>

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
            href={l("/why-insurance")}
          >
            {t("nav.whyInsurance")}
          </a>
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href={l("/faq")}
          >
            {t("nav.faq")}
          </a>
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href={l("/how-it-works")}
          >
            {t("nav.howItWorks")}
          </a>
          <a
            class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors py-2"
            href={l("/coverage-options")}
          >
            {t("nav.coverageOptions")}
          </a>
          <a
            class="bg-secondary hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all text-center"
            href={l("/contact")}
          >
            {t("nav.consultation")}
          </a>

          <div
            class="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-center space-x-4"
          >
            <a
              href={enHref}
              class="text-gray-700 dark:text-gray-300 font-medium {lang === 'en'
                ? 'text-primary underline'
                : ''}">EN</a
            >
            <span class="text-gray-300 dark:text-gray-700">|</span>
            <a
              href={esHref}
              class="text-gray-700 dark:text-gray-300 font-medium {lang === 'es'
                ? 'text-primary underline'
                : ''}">ES</a
            >
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>
