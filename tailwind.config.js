/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Google Sans', 'system-ui', 'sans-serif'],
            },
            colors: {
                'brand-primary': '#1D4ED8', // Biru Utama
                'brand-dark': '#0F172A',    // Navy Gelap
                'brand-gray': {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                },
                'brand-blue': {
                    50: '#EFF6FF',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                },
            },
        },
    },
    plugins: [],
}