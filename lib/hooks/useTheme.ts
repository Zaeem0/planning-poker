import { useEffect } from 'react';
import { useGameStore, type Theme } from '@/lib/store';

function getInitialTheme(): Theme {
  // Always default to 'default' theme
  return 'default';
}

export function useTheme(): void {
  const theme = useGameStore((state) => state.theme);
  const setTheme = useGameStore((state) => state.setTheme);

  // Initialize theme to default
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
