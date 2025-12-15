import { useEffect } from 'react';
import { useGameStore, THEME_STORAGE_KEY, type Theme } from '@/lib/store';

function isDecember(): boolean {
  const now = new Date();
  return now.getMonth() === 11; // December is month 11 (0-indexed)
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'default';

  // Check if user has a stored preference
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'christmas' || stored === 'default') {
    return stored;
  }

  // If no preference and it's December, default to Christmas theme
  if (isDecember()) {
    return 'christmas';
  }

  return 'default';
}

export function useTheme(): void {
  const theme = useGameStore((state) => state.theme);
  const setTheme = useGameStore((state) => state.setTheme);

  // Initialize theme from localStorage or auto-select Christmas in December
  useEffect(() => {
    const initialTheme = getInitialTheme();
    if (initialTheme !== theme) {
      setTheme(initialTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Apply theme class to body
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (theme === 'christmas') {
      document.body.classList.add('theme-christmas');
    } else {
      document.body.classList.remove('theme-christmas');
    }
  }, [theme]);
}
