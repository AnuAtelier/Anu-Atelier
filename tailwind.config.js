/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--secondary)',
          hover: 'var(--primary-hover)',
        },
        accent: 'var(--accent)',
        'bg-main': 'var(--bg-color)',
        surface: {
          DEFAULT: 'var(--bg-card)',
          2: 'var(--bg-input)',
        },
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-main': 'var(--border-color)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'card': 'var(--radius)',
        'pill': '50px',
      },
      boxShadow: {
        'sm-soft': 'var(--shadow-sm)',
        'md-soft': 'var(--shadow-md)',
        'lg-soft': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
