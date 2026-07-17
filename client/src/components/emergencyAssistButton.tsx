import { useEffect, useState } from 'react';

import { EmergencyAssistModal } from './emergencyAssistModal.js';

const SOS_COUNTDOWN_SECONDS = 10;

/** Floating emergency trigger with countdown confirmation modal. */
export function EmergencyAssistButton(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(SOS_COUNTDOWN_SECONDS);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    if (!isOpen || alertSent) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [alertSent, isOpen]);

  useEffect(() => {
    if (isOpen && countdown === 0 && !alertSent) {
      setAlertSent(true);
    }
  }, [alertSent, countdown, isOpen]);

  const open = (): void => {
    setCountdown(SOS_COUNTDOWN_SECONDS);
    setAlertSent(false);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
    setAlertSent(false);
  };

  const confirm = (): void => {
    window.dispatchEvent(new CustomEvent('arenaiq:sos', { detail: { countdown } }));
    setAlertSent(true);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Emergency Assistance"
        className="sos-button"
        onClick={open}
      >
        SOS
      </button>
      {isOpen ? (
        <EmergencyAssistModal
          countdown={countdown}
          alertSent={alertSent}
          onConfirm={confirm}
          onClose={close}
        />
      ) : null}
    </>
  );
}