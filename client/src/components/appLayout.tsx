import { NavLink, Outlet } from 'react-router-dom';

import { EmergencyAssistButton } from './emergencyAssistButton.js';
import { ThemeToggle } from './themeToggle.js';

/** Navigation entries for the two personas. */
const NAV_ITEMS = [
  { to: '/assistant', label: 'Fan Assistant' },
  { to: '/operations', label: 'Operations' },
] as const;

/** Top-level layout rendered around every route. */
export function AppLayout(): React.JSX.Element {
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
          <ThemeToggle />
        </div>
      </header>
      <EmergencyAssistButton />
      <main id="main-content" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
