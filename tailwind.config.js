/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        inazuma: {
          dark: '#070b14',
          card: '#0f172a',
          cardBorder: '#1e293b',
          accent: '#eab308',
          yellow: '#ffd000',
          cyan: '#00f0ff',
        },
        elem: {
          fire: '#ef4444',
          'fire-glow': '#f97316',
          wind: '#06b6d4',
          'wind-glow': '#3b82f6',
          earth: '#f59e0b',
          'earth-glow': '#d97706',
          wood: '#10b981',
          'wood-glow': '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Teko', 'Rajdhani', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'glow-fire': '0 0 20px rgba(239, 68, 68, 0.45)',
        'glow-wind': '0 0 20px rgba(6, 182, 212, 0.45)',
        'glow-earth': '0 0 20px rgba(245, 158, 11, 0.45)',
        'glow-wood': '0 0 20px rgba(16, 185, 129, 0.45)',
        'glow-gold': '0 0 25px rgba(234, 179, 8, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'lightning': 'lightning 2s ease-in-out infinite',
        'scanline': 'scanline 2s ease-in-out infinite',
      },
      keyframes: {
        lightning: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        scanline: {
          '0%, 100%': { transform: 'translateY(-90px)' },
          '50%': { transform: 'translateY(90px)' },
        },
      }
    },
  },
  plugins: [],
}
