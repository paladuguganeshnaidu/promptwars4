import OpenAI from 'openai';
import { env } from '../env.js';
import { AI_MAX_OUTPUT_TOKENS, AI_TIMEOUT_MS } from '../config/constants.js';
import { AppError } from './app-error.js';
import { logger } from './logger.js';
import { sanitizeModelText } from './sanitize-model-text.js';

let client: OpenAI | undefined;

function getClient(): OpenAI {
  client ??= new OpenAI({
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': env.APP_URL,
      'X-Title': 'ArenaIQ',
    },
  });

  return client;
}

async function requestText(prompt: string): Promise<string | undefined> {
  const response = await getClient().chat.completions.create(
    {
      model: env.OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      temperature: 0.2,
    },
    {
      timeout: AI_TIMEOUT_MS,
    },
  );

  const choice = response.choices[0];
  return choice?.message.content ?? undefined;
}

/**
 * Generates plain text from the AI provider for the given prompt.
 *
 * Transient failures are retried once; persistent failures surface as a 502
 * AppError so the client sees a sanitized, actionable message. Model output
 * is untrusted: it passes through {@link sanitizeModelText} (markup and
 * control characters stripped, length capped) before reaching any caller.
 *
 * @param prompt - Full prompt including system framing and grounding data.
 * @returns The model's sanitized text response.
 */
export async function generateText(prompt: string): Promise<string> {
  let text: string | undefined;
  try {
    text = await requestText(prompt);
  } catch (firstError) {
    logger.warn({ err: firstError }, 'AI service call failed, retrying once');
    try {
      text = await requestText(prompt);
    } catch (secondError) {
      logger.error({ err: secondError }, 'AI service call failed after retry');
      throw AppError.upstreamFailure('ai', 'The AI service is temporarily unavailable.');
    }
  }

  const sanitized = text === undefined ? '' : sanitizeModelText(text);
  if (sanitized === '') {
    throw AppError.upstreamFailure('ai', 'The AI service returned an empty response.');
  }

  return sanitized;
}
