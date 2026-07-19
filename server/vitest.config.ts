import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      OPENROUTER_API_KEY: 'test-key',
      OPENROUTER_MODEL: 'openrouter/free',
      APP_URL: 'http://localhost:5173',
      LOG_LEVEL: 'error',
      TELEMETRY_SIM_ENABLED: 'false',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // index.ts is the process bootstrap; *.types.ts files hold only type
      // declarations (no executable code to cover).
      exclude: ['src/index.ts', 'src/**/types.ts'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
