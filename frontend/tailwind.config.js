/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#285032',
          deep: '#1d3b25',
          light: '#356340',
          hover: '#22442b',
        },
        'bright-yellow': '#FFB900',
        'golden-yellow': '#FFC928',
        charcoal: {
          DEFAULT: '#222222',
          light: '#333333',
          dark: '#111111'
        },
        'muted-grey': '#777777',
        'pale-green': '#E8F0E9',
        'light-grey': '#F5F5F5',
        // Semantic alert touches
        risk: {
          critical: '#D9534F',
          warning: '#E67E22',
          moderate: '#FFB900',
          low: '#285032',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 16px -2px rgba(40, 80, 50, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        elevated: '0 10px 30px -4px rgba(40, 80, 50, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px -3px rgba(255, 185, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
