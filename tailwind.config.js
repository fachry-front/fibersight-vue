/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Syne', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
        body:    ['"Plus Jakarta Sans"', '"DM Sans"', 'sans-serif'],
      },
      colors: {
        // PDR exact palette
        'bg-base':        '#131210',
        'bg-surface':     '#1c1a16',
        'bg-card':        '#1c1a16',
        'bg-card-hover':  '#242118',
        'bg-sidebar':     '#161512',
        'text-primary':   '#e3e1dc',
        'text-secondary': '#9a9688',
        'text-muted':     '#565248',
        'accent-green':   '#7aad68',
        'accent-gold':    '#c4a23e',
        'accent-red':     '#c45252',
        'accent-orange':  '#c47030',
        'accent-teal':    '#4a9080',
        'normal-text':    '#7aad68',
        'warning-text':   '#c4a23e',
        'critical-text':  '#e06464',
      },
      borderColor: {
        DEFAULT: 'rgba(160,158,140,0.1)',
        hover:   'rgba(160,158,140,0.22)',
      },
      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(160,158,140,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(160,158,140,0.15)',
        glow:     '0 0 14px rgba(196,162,62,0.25)',
        'glow-red':'0 0 14px rgba(196,82,82,0.4)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.35' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(196,82,82,0.5)' },
          '50%':       { boxShadow: '0 0 18px rgba(196,82,82,0.9)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'loading-bar': {
          '0%, 100%': { opacity: '0.25', transform: 'scaleY(0.5)' },
          '50%':       { opacity: '1',   transform: 'scaleY(1)' },
        },
      },
      animation: {
        'pulse-dot':   'pulse-dot 2.2s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 1.6s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s ease forwards',
        'fade-in':     'fade-in 0.3s ease forwards',
        'toast-in':    'toast-in 0.2s ease forwards',
        'loading-bar': 'loading-bar 0.85s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
