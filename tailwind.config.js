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
        canvas: '#0A0B0D',
        panel: {
          DEFAULT: '#121418',
          hover: '#181B21',
          subtle: '#0F1114',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.04)',
          'border-focus': 'rgba(255, 255, 255, 0.20)',
        },
        ink: {
          primary: '#F3F4F6',
          secondary: '#8E949F',
          muted: '#5A606C',
          dark: '#3A3F49',
        },
        botchain: {
          DEFAULT: '#00E599',
          hover: '#05F7A6',
          dim: '#00B87A',
          tint: 'rgba(0, 229, 153, 0.07)',
          border: 'rgba(0, 229, 153, 0.25)',
          glow: 'rgba(0, 229, 153, 0.15)',
        },
        feedback: {
          positive: '#00E599',
          'positive-bg': 'rgba(0, 229, 153, 0.08)',
          'positive-border': 'rgba(0, 229, 153, 0.2)',
          constructive: '#F59E0B',
          'constructive-bg': 'rgba(245, 158, 11, 0.08)',
          'constructive-border': 'rgba(245, 158, 11, 0.2)',
          question: '#38BDF8',
          'question-bg': 'rgba(56, 189, 248, 0.08)',
          'question-border': 'rgba(56, 189, 248, 0.2)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle-card': '0 1px 2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'elevated-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
