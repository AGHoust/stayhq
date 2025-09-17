/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink': 'var(--ink)',
        'muted': 'var(--muted)',
        'surface': 'var(--surface)',
        'card': 'var(--card)',
        'border': 'var(--border)',
        'petrol': 'var(--petrol)',
        'ember': 'var(--ember)',
        'fig': 'var(--fig)',
        'fern': 'var(--fern)',
        'lastminute': 'var(--lastminute)',
        
        // Brand aliases for clarity
        'brand-ink': 'var(--ink)',
        'brand-porcelain': 'var(--card)',
        'brand-saffron': 'var(--ember)',
        'brand-petrol': 'var(--petrol)',
        'brand-fig': 'var(--fig)',
        'brand-oat': 'var(--surface)',
        'brand-fern': 'var(--fern)',
        'brand-coral': 'var(--lastminute)',
        'ink-muted': 'var(--muted)',
        'border-soft': 'var(--border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'custom': 'var(--shadow)',
      },
    },
  },
  plugins: [],
};