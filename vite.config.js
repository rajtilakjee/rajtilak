import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'spa-404',
      apply: 'build',
      closeBundle() {
        const dist = resolve('dist');
        copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
      },
    },
  ],
});
