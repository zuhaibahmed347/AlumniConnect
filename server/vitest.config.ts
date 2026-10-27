import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@alumni-connect/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      '@alumni-connect/shared/schemas': path.resolve(__dirname, '../shared/src/schemas.ts'),
      '@alumni-connect/shared/schemas/auth': path.resolve(__dirname, '../shared/src/schemas/auth.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
  },
});
