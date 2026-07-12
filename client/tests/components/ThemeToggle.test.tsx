import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '../../src/components/ThemeToggle.js';
import { ThemeProvider } from '../../src/contexts/ThemeContext.js';

function createMatchMedia(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '(prefers-color-scheme: light)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal('matchMedia', vi.fn(() => createMatchMedia(matches)));
}

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ThemeToggle', () => {
  it('throws when rendered outside the provider', () => {
    expect(() => render(<ThemeToggle />)).toThrow('useTheme must be used inside ThemeProvider.');
  });

  it('honours a stored theme and updates the html data-theme when switched', async () => {
    window.localStorage.setItem('arenaiq-theme', 'high-contrast');
    stubMatchMedia(false);

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'High Contrast' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    await user.click(screen.getByRole('button', { name: 'Dark' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('arenaiq-theme')).toBe('dark');
  });

  it('falls back to the system color scheme when nothing is stored', async () => {
    stubMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true');
    });
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});