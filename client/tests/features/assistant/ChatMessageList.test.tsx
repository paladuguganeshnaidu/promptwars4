import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChatMessageList } from '../../../src/features/assistant/chatMessageList.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('ChatMessageList', () => {
  it('shows an empty-state prompt when there are no turns', () => {
    render(<ChatMessageList turns={[]} />);

    expect(
      screen.getByText(/Ask a question or pick one above to get matchday directions/i),
    ).toBeInTheDocument();
  });

  it('animates the latest assistant reply and then marks it complete', () => {
    vi.useFakeTimers();

    render(
      <ChatMessageList
        turns={[
          { id: '1', role: 'fan', text: 'Where is gate 7?' },
          { id: '2', role: 'assistant', text: 'Gate 7 is by the east plaza.', language: 'en' },
        ]}
      />,
    );

    expect(screen.getByText('You asked')).toBeInTheDocument();
    expect(screen.getByText('ArenaIQ')).toBeInTheDocument();
    expect(
      screen.getByText('Gate 7 is by the east plaza.', { selector: 'span.visually-hidden' }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByText('Gate 7 is by the east plaza.', { selector: 'p.chat-message__body' }),
    ).toBeInTheDocument();
    expect(document.querySelector('p.chat-message__body[aria-hidden="true"]')).toBeNull();
  });
});