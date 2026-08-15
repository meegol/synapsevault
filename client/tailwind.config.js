/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gruvbox: {
          bgHard: '#1d2021',
          bg: '#282828',
          bgSoft: '#32302f',
          bg1: '#3c3836',
          bg2: '#504945',
          bg3: '#665c54',
          bg4: '#7c6f64',
          fg: '#ebdbb2',
          fgLight: '#fbf1c7',
          fgDim: '#d5c4a1',
          gray: '#a89984',
          red: '#fb4934',
          redDim: '#cc241d',
          green: '#b8bb26',
          greenDim: '#98971a',
          yellow: '#fabd2f',
          yellowDim: '#d79921',
          blue: '#83a598',
          blueDim: '#458588',
          purple: '#d3869b',
          purpleDim: '#b16286',
          aqua: '#8ec07c',
          aquaDim: '#689d6a',
          orange: '#fe8019',
          orangeDim: '#d65d0e',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow-yellow': '0 0 25px rgba(250, 189, 47, 0.25)',
        'glass-glow-aqua': '0 0 25px rgba(142, 192, 124, 0.25)',
        'glass-glow-red': '0 0 25px rgba(251, 73, 52, 0.25)',
        'glass-glow-orange': '0 0 25px rgba(254, 128, 25, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
