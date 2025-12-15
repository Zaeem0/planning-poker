'use client';

import { useGameStore } from '@/lib/store';
import '@/styles/snowfall.scss';

export function Snowfall() {
  const theme = useGameStore((state) => state.theme);

  if (theme !== 'christmas') {
    return null;
  }

  return (
    <div className="snowfall-container" aria-hidden="true">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 20}s`,
            opacity: 0.3 + Math.random() * 0.7,
            fontSize: `${10 + Math.random() * 10}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

