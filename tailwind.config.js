/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        // Core theme colors
        'app-bg':       '#f5f4f0',
        'app-surface':  '#ffffff',
        'app-surface2': '#f0efe9',
        'app-border':   '#e2e0d8',
        'app-text':     '#1a1917',
        'app-text2':    '#6b6960',
        'app-text3':    '#9e9b90',
        
        // Brand accents
        'brand-green': {
          DEFAULT: '#2d9e6b',
          light:   'rgba(45,158,107,0.12)',
        },
        'brand-pink': {
          DEFAULT: '#c94f7a',
          light:   'rgba(201,79,122,0.12)',
        },
        'brand-blue': {
          DEFAULT: '#3a7bc8',
          light:   'rgba(58,123,200,0.12)',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
