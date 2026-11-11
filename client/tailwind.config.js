/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep Navy (Primary text and high-priority action surfaces)
        navy: {
          50: '#F2F5F8',
          100: '#DFE6EE',
          200: '#C1CDDD',
          300: '#98ACBE',
          400: '#6F889F',
          500: '#4B6680',
          600: '#334B62',
          700: '#223548',
          800: '#142232',
          900: '#0B1524',
          950: '#060C15'
        },
        // Warm Off-White & Parchment (Backgrounds and secondary surfaces)
        warm: {
          50: '#FCFBF9',
          100: '#F8F6F1',
          200: '#EFECE4',
          300: '#E2DDD1',
          400: '#C9BFAD',
          500: '#A89B84'
        },
        // Muted Blue Accent (Interactive states, links, active pills)
        accent: {
          50: '#EEF4FF',
          100: '#D8E6FE',
          200: '#B5D1FD',
          300: '#87B4FC',
          400: '#548FF8',
          500: '#2F6FE4',
          600: '#2253AC',
          700: '#1B3E81',
          800: '#183367',
          900: '#172C54'
        },
        // Editorial Surface Tokens
        surface: {
          canvas: '#F8F6F1',
          card: '#FFFFFF',
          subtle: '#F2EFE8',
          border: '#E5E0D6'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        serif: ['"Newsreader"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(11, 21, 36, 0.04)',
        card: '0 2px 4px -1px rgba(11, 21, 36, 0.05), 0 1px 2px -1px rgba(11, 21, 36, 0.03)',
        editorial: '0 10px 25px -5px rgba(11, 21, 36, 0.04), 0 8px 10px -6px rgba(11, 21, 36, 0.02)'
      },
      borderRadius: {
        card: '8px',
        pill: '9999px'
      }
    }
  },
  plugins: []
};
