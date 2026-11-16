/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,css}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
      },
      colors: {
        /* Fond noir mat */
        night: '#0a0a0c',
        /* Surfaces charbon */
        charcoal: '#121215',
        graphite: '#17171b',
        /* Bordures fines */
        hairline: '#27272a',
        /* Accents rouge carmin profond */
        carmine: '#9f1239',
        ruby: '#e11d48',
      },
      boxShadow: {
        grimoire: '0 20px 50px -24px rgba(0, 0, 0, 0.95)',
        glow: '0 0 0 1px rgba(159, 18, 57, 0.35), 0 14px 34px -14px rgba(225, 29, 72, 0.35)',
      },
    },
  },
  plugins: [],
};
