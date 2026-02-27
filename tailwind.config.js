/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Google Sans', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['Google Sans Display', 'Georgia', 'serif'],
            },
            colors: {
                'bosdm-sky': '#F3F4F4',
                'bosdm-paper': '#EEF5FF',
                'bosdm-navy': '#1E3A8A',
                'brand-light': '#E0F2FE',
                'brand-dark': '#0F172A',
                'brand-primary': '#2563EB',
                'brand-red': '#E11D48',
                'brand-blue': {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
                'brand-gray': {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                },
            },
        },
    },
    plugins: [],
}
