/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep night-sky background ramp
        ink: {
          950: '#04060F',
          900: '#070A18',
          850: '#0A0E20',
          800: '#0E1430',
          750: '#121A3D',
          700: '#1A234C',
        },
        // Azure-blue brand accent
        brand: {
          200: '#BBD9FF',
          300: '#8EC2FF',
          400: '#5AA7FF',
          500: '#2E90FA',
          600: '#1F73E5',
          700: '#1A59C2',
        },
        // Secondary cyan used in gradients/glows
        glow: {
          300: '#86E7F5',
          400: '#41D6EE',
          500: '#22C3DE',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Elegant serif used for the watercolor landing headline
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(46, 144, 250, 0.55)',
        'glow-lg': '0 0 80px -10px rgba(46, 144, 250, 0.6)',
        panel: '0 24px 60px -24px rgba(0, 0, 0, 0.75)',
        // Soft lift for light frosted studio surfaces
        soft: '0 10px 30px -12px rgba(20, 40, 90, 0.18)',
        'soft-lg': '0 24px 60px -24px rgba(20, 40, 90, 0.28)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #2E90FA 0%, #41D6EE 100%)',
        // Softer periwinkle "moonlight" gradient used across the studio
        'moon-gradient': 'linear-gradient(120deg, #5B8DEF 0%, #84B3FF 100%)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        floaty: 'floaty 8s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
