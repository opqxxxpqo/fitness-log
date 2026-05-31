/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paper-warm palette extracted from ACN1~ACN4 Figma exports
        bg: '#F2F0EC',
        surface: '#E7E4DE',
        ink: '#0A0A0A',
        ink2: '#1A1A1A',
        accent: '#FF3B1F',
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
        doto: ['Doto', '"JetBrains Mono"', 'monospace'],
        vt: ['VT323', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0',
      },
      letterSpacing: {
        tightish: '-0.01em',
        wide2: '0.08em',
        wide3: '0.12em',
      },
      boxShadow: {
        // very subtle; design is brutalist/zero-shadow but we let the shell breathe on desktop
        shell: '0 14px 34px rgba(48, 42, 32, 0.06)',
      },
    },
  },
  plugins: [],
};
