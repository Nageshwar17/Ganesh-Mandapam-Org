import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcssPlugin from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcssPlugin()],
});
