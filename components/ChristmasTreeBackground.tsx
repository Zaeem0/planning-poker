'use client';

import { useGameStore } from '@/lib/store';
import '@/styles/christmas-tree-background.scss';

export function ChristmasTreeBackground() {
  const theme = useGameStore((state) => state.theme);

  if (theme !== 'christmas') {
    return null;
  }

  return (
    <div className="christmas-tree-background" aria-hidden="true">
      <svg
        className="christmas-tree-svg"
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tree trunk */}
        <rect x="85" y="240" width="30" height="60" fill="#5d4037" />
        
        {/* Tree layers - bottom to top */}
        <polygon
          points="100,240 40,240 100,180"
          fill="#1b5e20"
          opacity="0.8"
        />
        <polygon
          points="100,240 160,240 100,180"
          fill="#2e7d32"
          opacity="0.8"
        />
        
        <polygon
          points="100,200 50,200 100,140"
          fill="#1b5e20"
          opacity="0.8"
        />
        <polygon
          points="100,200 150,200 100,140"
          fill="#2e7d32"
          opacity="0.8"
        />
        
        <polygon
          points="100,160 60,160 100,100"
          fill="#1b5e20"
          opacity="0.8"
        />
        <polygon
          points="100,160 140,160 100,100"
          fill="#2e7d32"
          opacity="0.8"
        />
        
        <polygon
          points="100,120 70,120 100,60"
          fill="#1b5e20"
          opacity="0.8"
        />
        <polygon
          points="100,120 130,120 100,60"
          fill="#2e7d32"
          opacity="0.8"
        />
        
        {/* Star on top */}
        <polygon
          points="100,50 105,65 120,65 108,75 113,90 100,80 87,90 92,75 80,65 95,65"
          fill="#ffd700"
        />
        
        {/* Ornaments - red */}
        <circle cx="85" cy="190" r="4" fill="#dc143c" />
        <circle cx="115" cy="195" r="4" fill="#dc143c" />
        <circle cx="75" cy="150" r="4" fill="#dc143c" />
        <circle cx="125" cy="145" r="4" fill="#dc143c" />
        <circle cx="90" cy="110" r="4" fill="#dc143c" />
        
        {/* Ornaments - gold */}
        <circle cx="95" cy="220" r="4" fill="#ffd700" />
        <circle cx="105" cy="215" r="4" fill="#ffd700" />
        <circle cx="80" cy="170" r="4" fill="#ffd700" />
        <circle cx="120" cy="165" r="4" fill="#ffd700" />
        <circle cx="110" cy="130" r="4" fill="#ffd700" />
        
        {/* Ornaments - blue */}
        <circle cx="100" cy="230" r="4" fill="#b3e5fc" />
        <circle cx="70" cy="210" r="4" fill="#b3e5fc" />
        <circle cx="130" cy="205" r="4" fill="#b3e5fc" />
        <circle cx="85" cy="135" r="4" fill="#b3e5fc" />
        <circle cx="115" cy="115" r="4" fill="#b3e5fc" />
      </svg>
    </div>
  );
}

