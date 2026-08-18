/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#b91c1c',
        'text-base': '#111111',
        muted: '#6b7280',
        border: '#e7e5e4',
        'bg-page': '#f5f3f2',
        'bg-surface': '#ffffff',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#7f1d1d',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
