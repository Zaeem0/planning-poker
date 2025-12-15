'use client';

import { useGameStore } from '@/lib/store';
import '@/styles/christmas-lights.scss';

export function ChristmasLights() {
  const theme = useGameStore((state) => state.theme);

  if (theme !== 'christmas') {
    return null;
  }

  const lights = [
    { color: 'red', delay: 0 },
    { color: 'gold', delay: 0.2 },
    { color: 'green', delay: 0.4 },
    { color: 'blue', delay: 0.6 },
    { color: 'red', delay: 0.8 },
    { color: 'gold', delay: 1.0 },
    { color: 'green', delay: 1.2 },
    { color: 'blue', delay: 1.4 },
    { color: 'red', delay: 1.6 },
    { color: 'gold', delay: 1.8 },
    { color: 'green', delay: 2.0 },
    { color: 'blue', delay: 2.2 },
    { color: 'red', delay: 2.4 },
    { color: 'gold', delay: 2.6 },
    { color: 'green', delay: 2.8 },
    { color: 'blue', delay: 3.0 },
    { color: 'red', delay: 3.2 },
    { color: 'gold', delay: 3.4 },
    { color: 'green', delay: 3.6 },
    { color: 'blue', delay: 3.8 },
  ];

  return (
    <div className="christmas-lights-container" aria-hidden="true">
      {/* Top lights */}
      <div className="christmas-lights-string christmas-lights-top">
        <div className="lights-wire" />
        {lights.map((light, i) => (
          <div
            key={`top-${i}`}
            className={`christmas-light christmas-light-${light.color}`}
            style={{
              left: `${(i / (lights.length - 1)) * 100}%`,
              animationDelay: `${light.delay}s`,
            }}
          >
            <div className="light-bulb" />
            <div className="light-glow" />
          </div>
        ))}
      </div>

      {/* Left side lights */}
      <div className="christmas-lights-string christmas-lights-left">
        <div className="lights-wire" />
        {lights.slice(0, 10).map((light, i) => (
          <div
            key={`left-${i}`}
            className={`christmas-light christmas-light-${light.color}`}
            style={{
              top: `${(i / 9) * 100}%`,
              animationDelay: `${light.delay + 0.5}s`,
            }}
          >
            <div className="light-bulb" />
            <div className="light-glow" />
          </div>
        ))}
      </div>

      {/* Right side lights */}
      <div className="christmas-lights-string christmas-lights-right">
        <div className="lights-wire" />
        {lights.slice(0, 10).map((light, i) => (
          <div
            key={`right-${i}`}
            className={`christmas-light christmas-light-${light.color}`}
            style={{
              top: `${(i / 9) * 100}%`,
              animationDelay: `${light.delay + 1}s`,
            }}
          >
            <div className="light-bulb" />
            <div className="light-glow" />
          </div>
        ))}
      </div>
    </div>
  );
}

