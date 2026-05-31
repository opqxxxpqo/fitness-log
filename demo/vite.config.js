import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pages serves at https://opqxxxpqo.github.io/app-fitness-log/, so the
// production build needs that subpath. Dev keeps root for ergonomics.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    process.env.VITE_BASE ||
    (mode === 'production' ? '/app-fitness-log/' : '/'),
  server: { port: 5173, host: true },
}));
