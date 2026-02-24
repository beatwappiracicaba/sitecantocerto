import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0a0a0f',
        neon: {
          pink: '#ff2e92',
          blue: '#25c2ff',
          green: '#35ff9d',
          yellow: '#ffe359'
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      backgroundImage: {
        grain: 'radial-gradient(circle at 20% 10%, rgba(255,46,146,0.25), transparent 30%), radial-gradient(circle at 80% 30%, rgba(37,194,255,0.25), transparent 35%), radial-gradient(circle at 40% 80%, rgba(53,255,157,0.25), transparent 40%)'
      }
    }
  },
  plugins: []
} satisfies Config
