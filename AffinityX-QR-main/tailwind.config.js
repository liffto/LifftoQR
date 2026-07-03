/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand blue used across buttons, links, active states
        primary: {
          DEFAULT: '#1B59F5',
          50: '#EEF3FF',
          100: '#D9E4FF',
          200: '#B6CCFF',
          300: '#85A8FF',
          400: '#5781FF',
          500: '#1B59F5',
          600: '#0F44D6',
          700: '#0E37AB',
          800: '#102F86',
          900: '#122A6A',
        },
        ink: {
          DEFAULT: '#1F2430',
          soft: '#3A3F4B',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        line: '#E6E8EC',
        canvas: '#F4F5F7',
        success: '#16A34A',
        danger: '#EF4444',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        panel: '0 8px 24px rgba(16, 24, 40, 0.06)',
        pop: '0 12px 32px rgba(16, 24, 40, 0.14)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [],
}
