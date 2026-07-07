/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1d2e81', // Deep Blue from logo
                secondary: '#2e7d32', // Green from logo
                'cta-green': '#15803d', // Green-700
                'cta-green-hover': '#166534', // Green-800
                'background-light': '#f8f9fa',
                'background-dark': '#121212',
                'surface-light': '#ffffff',
                'surface-dark': '#1e1e1e',
                'text-light': '#333333',
                'text-dark': '#e0e0e0',
            },
            fontFamily: {
                display: ['Montserrat', 'sans-serif'],
                body: ['Open Sans', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                xl: '1rem',
            },
        },
    },
    plugins: [],
};
