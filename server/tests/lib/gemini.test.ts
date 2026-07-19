import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../src/lib/app-error.js';

const createMock = vi.fn();

vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: createMock,
      },
    };
  },
}));

const { generateText } = await import('../../src/lib/ai.js');

describe('generateText', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns trimmed model text on success', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: '  Gate 6 is step-free.  ',
          },
        },
      ],
    });
    await expect(generateText('prompt')).resolves.toBe('Gate 6 is step-free.');
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('retries once after a transient failure and then succeeds', async () => {
    createMock
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockResolvedValue({
        choices: [
          {
            message: {
              content: 'answer',
            },
          },
        ],
      });
    await expect(generateText('prompt')).resolves.toBe('answer');
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it('maps repeated failures to a 502 AppError with a sanitized message', async () => {
    createMock.mockRejectedValue(new Error('internal quota detail'));
    const error = await generateText('prompt').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(502);
    expect((error as AppError).message).not.toContain('quota');
  });

  it('treats an empty model response as an upstream failure', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: '',
          },
        },
      ],
    });
    const error = await generateText('prompt').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(502);
  });

  it('treats a missing model response text as an upstream failure', async () => {
    createMock.mockResolvedValue({ choices: [{}] });
    const error = await generateText('prompt').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(502);
  });
});
