import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#020203',
          base: '#050506',
          elevated: '#0a0a0c',
          surface: 'rgba(255, 255, 255, 0.04)',
          'surface-strong': 'rgba(255, 255, 255, 0.08)'
        },
        fg: {
          DEFAULT: '#EDEDEF',
          muted: '#8A8F98',
          subtle: '#5C606A'
        },
        accent: {
          DEFAULT: '#FF3D71',
          glow: 'rgba(255, 61, 113, 0.25)',
          alt: '#5E6AD2',
          play: '#22C55E'
        },
        spotify: '#1DB954',
        soundcloud: '#FF5500',
        line: 'rgba(255, 255, 255, 0.08)',
        'line-strong': 'rgba(255, 255, 255, 0.12)'
      },
      backgroundImage: {
        'accent-gradient':
          'linear-gradient(135deg, #FF3D71 0%, #5E6AD2 100%)',
        'page-gradient':
          'radial-gradient(ellipse 1200px 800px at 50% -10%, rgba(94, 106, 210, 0.18) 0%, rgba(255, 61, 113, 0.05) 30%, transparent 60%), linear-gradient(180deg, #0a0a0c 0%, #050506 60%, #020203 100%)'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ]
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        h1: ['32px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        label: ['11px', { lineHeight: '1.2', letterSpacing: '0.12em', fontWeight: '500' }]
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px'
      },
      boxShadow: {
        glow: '0 0 40px 0 rgba(255, 61, 113, 0.18)',
        elevated: '0 20px 60px -20px rgba(0, 0, 0, 0.6)',
        sticker: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)'
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      animation: {
        'fade-in': 'fadeIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 24s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
