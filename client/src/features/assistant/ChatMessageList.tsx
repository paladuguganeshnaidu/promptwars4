// Renders the assistant conversation. New answers are announced politely via
// aria-live so screen-reader users hear responses without moving focus.
import { useState, useEffect } from 'react';
import type { ChatTurn } from './useAssistant.js';

interface ChatMessageListProps {
  turns: ChatTurn[];
}

const ROLE_LABEL: Record<ChatTurn['role'], string> = {
  fan: 'You asked',
  assistant: 'ArenaIQ',
};

function TypedText({ text, active, onComplete }: { text: string; active: boolean; onComplete?: () => void }): React.JSX.Element {
  const [displayedText, setDisplayedText] = useState(active ? '' : text);

  useEffect(() => {
    if (!active) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 10); // Very fast typing speed for better user experience

    return () => {
      clearInterval(interval);
    };
  }, [text, active, onComplete]);

  return (
    <>
      {displayedText}
      {active && <span className="typing-cursor" aria-hidden="true" />}
    </>
  );
}

/** Accessible, live-updating transcript of the fan conversation. */
export function ChatMessageList({ turns }: ChatMessageListProps): React.JSX.Element {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  if (turns.length === 0) {
    return (
      <p className="muted" aria-live="polite">
        Ask a question or pick one above to get matchday directions, accessibility guidance and
        transport help.
      </p>
    );
  }

  return (
    <ul className="chat-log" aria-live="polite" aria-label="Conversation">
      {turns.map((turn, index) => {
        const isLatest = index === turns.length - 1;
        const shouldAnimate = turn.role === 'assistant' && isLatest && !completedIds.has(turn.id);

        return (
          <li key={turn.id} className={`chat-message chat-message--${turn.role}`}>
            <p className="chat-message__role">{ROLE_LABEL[turn.role]}</p>
            {/* dir="auto" keeps right-to-left content (Arabic) reading correctly;
                lang tells screen readers which phonetics to use (WCAG 3.1.2). */}
            {shouldAnimate ? (
              <>
                <span className="visually-hidden" aria-live="polite">
                  {turn.text}
                </span>
                <p className="chat-message__body" dir="auto" lang={turn.language} aria-hidden="true">
                  <TypedText
                    text={turn.text}
                    active={true}
                    onComplete={() => {
                      setCompletedIds((prev) => {
                        const next = new Set(prev);
                        next.add(turn.id);
                        return next;
                      });
                    }}
                  />
                </p>
              </>
            ) : (
              <p className="chat-message__body" dir="auto" lang={turn.language}>
                {turn.text}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
