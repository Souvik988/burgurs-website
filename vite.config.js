import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Test screenshots, art masters and research dumps are huge and change constantly; watching them
    // keeps the dev server busy (and OneDrive syncing) for no benefit.
    watch: { ignored: ['**/output/**', '**/art-masters/**', '**/research/**', '**/scripts/**', '**/.agents/**', '**/dist/**'] },
  },
});
