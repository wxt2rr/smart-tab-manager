/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF8FF',
          100: '#BEE3F8',
          200: '#90CDF4',
          300: '#63B3ED',
          400: '#4299E1',
          500: '#007AFF', // Apple Blue
          600: '#0051D5',
          700: '#2C5282',
          800: '#2A4365',
          900: '#1A365D',
        },
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
        purple: '#AF52DE',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        dark: {
          bg: '#1C1C1E',
          surface: '#2C2C2E',
          elevated: '#3A3A3C',
          border: '#48484A',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          'sans-serif'
        ]
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '15px',
        'lg': '17px',
        'xl': '22px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.07)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.1)',
        'card': '0 4px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
      animation: {
        'spring': 'spring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'ripple': 'ripple 0.6s ease-out',
        'loading': 'loading 1.5s infinite',
      },
      keyframes: {
        spring: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        },
        loading: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}