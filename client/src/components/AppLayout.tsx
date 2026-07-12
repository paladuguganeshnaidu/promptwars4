// Application shell: skip link, banner with primary navigation, and the main
// landmark that wraps every route. Provides the semantic structure assistive
// technology relies on.
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useTheme } from '../contexts/ThemeContext.js';

/** Navigation entries for the two personas. */
const NAV_ITEMS = [
  { to: '/assistant', label: 'Fan Assistant' },
  { to: '/operations', label: 'Operations' },
] as const;

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'high-contrast', label: 'High Contrast' },
] as const;

const SOS_COUNTDOWN_SECONDS = 10;

/** Top-level layout rendered around every route. */
export function AppLayout(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [countdown, setCountdown] = useState(SOS_COUNTDOWN_SECONDS);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    if (!isSosOpen || alertSent) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [alertSent, isSosOpen]);

  useEffect(() => {
    if (isSosOpen && countdown === 0 && !alertSent) {
      setAlertSent(true);
    }
  }, [alertSent, countdown, isSosOpen]);

  const openSos = (): void => {
    setCountdown(SOS_COUNTDOWN_SECONDS);
    setAlertSent(false);
    setIsSosOpen(true);
  };

  const closeSos = (): void => {
    setIsSosOpen(false);
    setAlertSent(false);
  };

  const confirmSos = (): void => {
    window.dispatchEvent(new CustomEvent('arenaiq:sos', { detail: { countdown } }));
    setAlertSent(true);
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="brand">
            Arena<span>IQ</span>
          </NavLink>
          <nav className="primary-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="theme-toggle" role="group" aria-label="Theme mode">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="theme-toggle__button"
                aria-pressed={theme === option.value}
                onClick={() => {
                  setTheme(option.value);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <button
        type="button"
        role="button"
        aria-label="Emergency Assistance"
        className="sos-button"
        onClick={openSos}
      >
        SOS
      </button>
      {isSosOpen ? (
        <div className="sos-modal" role="dialog" aria-modal="true" aria-labelledby="sos-title">
          <div className="sos-modal__panel">
            <h2 id="sos-title">Emergency Assistance</h2>
            <p className="page-intro">
              Organizers will be alerted after the countdown reaches zero. You can confirm now or
              cancel this request.
            </p>
            <p className="sos-modal__countdown" aria-live="polite">
              Alert dispatches in {countdown} seconds.
            </p>
            {alertSent ? <p className="status-message">Alert sent to organizers.</p> : null}
            <div className="form-actions sos-modal__actions">
              <button type="button" className="button" onClick={confirmSos}>
                Confirm alert now
              </button>
              <button type="button" className="button button--secondary" onClick={closeSos}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <main id="main-content" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
