import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EmergencyAssistButton } from '../../src/components/EmergencyAssistButton.js';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('EmergencyAssistButton', () => {
  it('opens the modal and counts down while waiting', () => {
    vi.useFakeTimers();

    render(<EmergencyAssistButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Emergency Assistance' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Alert dispatches in 10 seconds/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Alert dispatches in 9 seconds/)).toBeInTheDocument();
  });

  it('dispatches the SOS event and closes when cancelled', () => {
    const listener = vi.fn();
    window.addEventListener('arenaiq:sos', listener as EventListener);

    render(<EmergencyAssistButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Emergency Assistance' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm alert now' }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]?.[0] as CustomEvent<{ countdown: number }>).detail.countdown).toBe(
      10,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    window.removeEventListener('arenaiq:sos', listener as EventListener);
  });
});