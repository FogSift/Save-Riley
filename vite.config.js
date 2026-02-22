import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Resolve fogsift.config.js if it exists in the repo root;
// otherwise fall back to the built-in defaults so forked repos build cleanly.
const configPath = resolve(process.cwd(), 'fogsift.config.js');
const hasConfig  = existsSync(configPath);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'fogsift:config': hasConfig
        ? configPath
        : resolve(process.cwd(), 'src/lib/fogsiftConfig.js'),
    },
  },
  define: {
    __FOGSIFT_HAS_CONFIG__: JSON.stringify(hasConfig),
  },
});
