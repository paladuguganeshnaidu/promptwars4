import { describe, expect, it, vi } from 'vitest';

import { loadEnv } from '../../src/config/env.js';

const VALID_ENV = { GEMINI_API_KEY: 'key' };

describe('loadEnv', () => {
  it('applies documented defaults when optional variables are absent', () => {
    const env = loadEnv(VALID_ENV);
    expect(env.PORT).toBe(8080);
    expect(env.NODE_ENV).toBe('development');
    expect(env.GEMINI_MODEL).toBe('gemini-2.0-flash');
    expect(env.TELEMETRY_SIM_ENABLED).toBe(true);
  });

  it('parses PORT as a number and TELEMETRY_SIM_ENABLED=false as a boolean', () => {
    const env = loadEnv({ ...VALID_ENV, PORT: '9090', TELEMETRY_SIM_ENABLED: 'false' });
    expect(env.PORT).toBe(9090);
    expect(env.TELEMETRY_SIM_ENABLED).toBe(false);
  });

  it('rejects a missing GEMINI_API_KEY with a message naming the variable', () => {
    expect(() => loadEnv({})).toThrowError(/GEMINI_API_KEY/);
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => loadEnv({ ...VALID_ENV, PORT: 'not-a-port' })).toThrowError(/PORT/);
  });

  it('rejects an unknown LOG_LEVEL', () => {
    expect(() => loadEnv({ ...VALID_ENV, LOG_LEVEL: 'verbose' })).toThrowError(/LOG_LEVEL/);
  });

  it('fails fast at startup when the required Gemini key is missing', async () => {
    const previousKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    vi.resetModules();
    await expect(import('../../src/env.js')).rejects.toThrow('process.exit(1)');

    exitSpy.mockRestore();
    writeSpy.mockRestore();
    if (previousKey !== undefined) {
      process.env.GEMINI_API_KEY = previousKey;
    }
  });
});
