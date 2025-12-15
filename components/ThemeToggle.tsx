'use client';

import { useGameStore } from '@/lib/store';
import { ChristmasIcon, DefaultThemeIcon } from '@/components/icons';

export function ThemeToggle() {
  const theme = useGameStore((state) => state.theme);
  const setTheme = useGameStore((state) => state.setTheme);

  const handleToggle = () => {
    setTheme(theme === 'christmas' ? 'default' : 'christmas');
  };

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle-button"
      aria-label={
        theme === 'christmas' ? 'Switch to default theme' : 'Switch to Christmas theme'
      }
      title={
        theme === 'christmas' ? 'Switch to default theme' : 'Switch to Christmas theme'
      }
    >
      {theme === 'christmas' ? <DefaultThemeIcon /> : <ChristmasIcon />}
    </button>
  );
}

