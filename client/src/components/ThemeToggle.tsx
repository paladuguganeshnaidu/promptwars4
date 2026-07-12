import { useTheme, type ThemeMode } from '../contexts/ThemeContext.js';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'high-contrast', label: 'High Contrast' },
];

/** Theme mode switcher rendered in the global shell. */
export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" aria-label="Theme mode">
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
  );
}