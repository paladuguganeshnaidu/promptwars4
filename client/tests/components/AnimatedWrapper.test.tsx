import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const useReducedMotionMock = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
    },
    useReducedMotion: useReducedMotionMock,
  };
});

import { AnimatedWrapper } from '../../src/components/AnimatedWrapper.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AnimatedWrapper', () => {
  it('animates when reduced motion is disabled', () => {
    useReducedMotionMock.mockReturnValue(false);

    render(
      <AnimatedWrapper>
        <span>Content</span>
      </AnimatedWrapper>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders without motion when reduced motion is enabled', () => {
    useReducedMotionMock.mockReturnValue(true);

    render(
      <AnimatedWrapper>
        <span>Content</span>
      </AnimatedWrapper>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});