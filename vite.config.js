import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : indispensable pour que les assets et scripts se chargent
  // correctement une fois hébergés dans un sous-dossier (GitHub Pages).
  base: './',
  server: {
    open: true,
  },
});
