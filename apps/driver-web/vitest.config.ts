import { defineConfig } from 'vitest/config';

// Unit tests for app-local pure helpers (lib/*). Component/E2E coverage is Playwright.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
