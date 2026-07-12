// Layered rate limiting: a general API budget per client, plus a stricter
// budget on the Gemini-backed endpoints to bound inference cost.
import { rateLimit } from 'express-rate-limit';

import { API_RATE_LIMIT, GENAI_RATE_LIMIT } from '../config/constants.js';

const RATE_LIMIT_MESSAGE = {
  success: false,
  error: 'Too many Requests',
};

/** General limit applied to every /api route. */
export const apiLimiter = rateLimit({
  windowMs: API_RATE_LIMIT.windowMs,
  limit: API_RATE_LIMIT.limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});

/** Stricter limit for endpoints that trigger Gemini inference. */
export const genAiLimiter = rateLimit({
  windowMs: GENAI_RATE_LIMIT.windowMs,
  limit: GENAI_RATE_LIMIT.limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});

/** Assistant-specific limit for the question endpoint. */
export const assistantLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
  handler: (_req, res, _next, options) => {
    res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000).toString());
    res.status(options.statusCode).json(RATE_LIMIT_MESSAGE);
  },
});
