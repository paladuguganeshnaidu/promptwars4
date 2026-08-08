// Crash-fast environment validation for server startup. The process refuses to
// boot with missing or malformed configuration so failures happen before any
// request is served.
import { z } from 'zod';

import { DEFAULT_PORT } from './config/constants.js';

const booleanFlag = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  OPENROUTER_MODEL: z.string().min(1).default('openai/gpt-oss-120b:free'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  REDIS_URL: z.string().min(1).optional(),
  GOOGLE_CLOUD_PROJECT: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z.string().default(''),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  TELEMETRY_SIM_ENABLED: booleanFlag,
});

/** Validated application configuration derived from process.env. */
export type Env = z.infer<typeof envSchema>;

/** Parses and validates environment variables for tests and startup. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration - ${details}`);
  }
  return result.data;
}

function loadRuntimeEnv(): Env {
  try {
    return loadEnv();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown environment error';
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

/** Configuration validated once at module load. */
export const env: Env = loadRuntimeEnv();