/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hospital Brand Colors - extracted from official emblem
        brand: {
          green: {
            DEFAULT: '#2E7D32',
            light:   '#43A047',
            dark:    '#1B5E20',
            50:      '#E8F5E9',
            100:     '#C8E6C9',
            200:     '#A5D6A7',
          },
          blue: {
            DEFAULT: '#1565C0',
            light:   '#1E88E5',
            dark:    '#0D47A1',
            50:      '#E3F2FD',
            100:     '#BBDEFB',
            200:     '#90CAF9',
          },
          red: {
            DEFAULT: '#C62828',
            light:   '#E53935',
            dark:    '#B71C1C',
            50:      '#FFEBEE',
            100:     '#FFCDD2',
            200:     '#EF9A9A',
          },
        },
      },
      fontFamily: {
        cairo:   ['Cairo', 'Tajawal', 'sans-serif'],
        tajawal: ['Tajawal', 'Cairo', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fadeIn':   'fadeIn 0.2s ease-out',
        'scaleUp':  'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideDown':'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleUp: {
          from: { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
