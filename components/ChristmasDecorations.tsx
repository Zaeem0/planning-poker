'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import '@/styles/christmas-decorations.scss';

const CHRISTMAS_GIFS = [
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmRiZ3hvN2JtMWw5aW1md3NyNXNjOHJpNXVxZjJ6c2Y3c2k1a3RpNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26n5ZZfTd3cBLoj2E/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjMzbjZoNzh5YTcwZHdlNjZubXdzcGNzNHFrcnFvbXUwZmk4bGt4YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RIjVnmAtOD4l4c2Ert/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3UzYnA1N2J5OTAzbXl3dDc1b2lkbGwxMGtvdDBnY2IxaXZmajczMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dDUC94GA0rtcVQabVi/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExam0wajZ1dGE0ZzQ1djR1OGI1M3l4cWs1ZXlzdnc4Z2J6eDRjZHRjbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HBMCmtsPEUShG/giphy.gif', // carlton
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHU2ODloNDN1ZGlhbGViMzFwYXF3MXNkbjdyeDJvdWl2c2dlNnM1MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MrxXXBriEIKBO/giphy.gif', // buddy spin
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmE0MDd0Zjd2ZDlmeTd3NnZueWdncTZ2eTV0OGpwbmNuaGlkcmhkdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/J02IfE7NGbJrfrTtrb/giphy.gif', // kevin
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXVrcGNkbjQzb3R6MGV6aG91YXo1M2Y1YW4xbnhuZzJzczR6NmJ6YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qQFnoBIbMeZuzZgewF/giphy.gif', // six seven
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3lsajllNDRhandoOHBxbnlkM2I5Ymo0Z3liczJsbzJ2a3FsYzR6byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3mZ6dTY9MpszWdI4/giphy.gif', // wrestling
];

function getRandomGif(usedGifs: Set<string>): string {
  const availableGifs = CHRISTMAS_GIFS.filter((gif) => !usedGifs.has(gif));

  if (availableGifs.length === 0) {
    return CHRISTMAS_GIFS[Math.floor(Math.random() * CHRISTMAS_GIFS.length)];
  }

  return availableGifs[Math.floor(Math.random() * availableGifs.length)];
}

let sharedAudioContext: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let isJinglePlaying = false;

function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return sharedAudioContext;
}

const JINGLE_BELLS_NOTES = [
  { freq: 659.25, time: 0.0, duration: 0.2 },
  { freq: 659.25, time: 0.2, duration: 0.2 },
  { freq: 659.25, time: 0.4, duration: 0.4 },
  { freq: 659.25, time: 0.9, duration: 0.2 },
  { freq: 659.25, time: 1.1, duration: 0.2 },
  { freq: 659.25, time: 1.3, duration: 0.4 },
  { freq: 659.25, time: 1.8, duration: 0.2 },
  { freq: 783.99, time: 2.0, duration: 0.2 },
  { freq: 523.25, time: 2.2, duration: 0.3 },
  { freq: 587.33, time: 2.5, duration: 0.2 },
  { freq: 659.25, time: 2.7, duration: 0.5 },
];

function stopAllJingles() {
  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      // Oscillator may already be stopped
    }
  });
  activeOscillators = [];
}

function playChimeSound() {
  try {
    // Don't start a new jingle if one is already playing
    if (isJinglePlaying) {
      return;
    }

    isJinglePlaying = true;

    const audioContext = getAudioContext();
    const now = audioContext.currentTime;

    JINGLE_BELLS_NOTES.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.freq, now + note.time);

      gainNode.gain.setValueAtTime(0, now + note.time);
      gainNode.gain.linearRampToValueAtTime(0.08, now + note.time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        now + note.time + note.duration
      );

      oscillator.start(now + note.time);
      oscillator.stop(now + note.time + note.duration);

      // Track active oscillators
      activeOscillators.push(oscillator);

      // Remove from tracking when done
      oscillator.onended = () => {
        const index = activeOscillators.indexOf(oscillator);
        if (index > -1) {
          activeOscillators.splice(index, 1);
        }
        // Mark jingle as finished when all oscillators are done
        if (activeOscillators.length === 0) {
          isJinglePlaying = false;
        }
      };
    });
  } catch (error) {
    console.warn('Web Audio API not supported:', error);
  }
}

interface ActiveGif {
  id: string;
  url: string;
  position: 'left' | 'right';
}

export function ChristmasDecorations() {
  const theme = useGameStore((state) => state.theme);
  const [openPresents, setOpenPresents] = useState<Set<string>>(new Set());
  const [usedGifs, setUsedGifs] = useState<Set<string>>(new Set());
  const [activeGifs, setActiveGifs] = useState<ActiveGif[]>([]);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const closeTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
      closeTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      closeTimeoutsRef.current.clear();
    };
  }, []);

  if (theme !== 'christmas') {
    return null;
  }

  const allGifsUsed = usedGifs.size >= CHRISTMAS_GIFS.length;

  const togglePresent = (presentId: string) => {
    // If present is already open, do nothing
    if (openPresents.has(presentId)) {
      return;
    }

    // If all GIFs have been used, don't allow opening
    if (allGifsUsed) {
      return;
    }

    // Open the present
    setOpenPresents((prev) => new Set(prev).add(presentId));
    playChimeSound();

    const selectedGif = getRandomGif(usedGifs);
    setUsedGifs((prev) => new Set(prev).add(selectedGif));

    const gifId = `${presentId}-${Date.now()}`;
    const newGif: ActiveGif = {
      id: gifId,
      url: selectedGif,
      position: presentId as 'left' | 'right',
    };

    setActiveGifs((prevGifs) => [...prevGifs, newGif]);

    // Remove GIF after 6.5 seconds
    const gifTimeoutId = setTimeout(() => {
      setActiveGifs((prevGifs) => prevGifs.filter((gif) => gif.id !== gifId));
      timeoutsRef.current.delete(gifTimeoutId);
    }, 6500);

    timeoutsRef.current.add(gifTimeoutId);

    // Close present after GIF is done, unless all GIFs have been used
    const closeTimeoutId = setTimeout(() => {
      setUsedGifs((currentUsedGifs) => {
        // Check if all GIFs have been used at execution time
        if (currentUsedGifs.size < CHRISTMAS_GIFS.length) {
          setOpenPresents((prev) => {
            const newSet = new Set(prev);
            newSet.delete(presentId);
            return newSet;
          });
        }
        return currentUsedGifs;
      });
      closeTimeoutsRef.current.delete(presentId);
    }, 7000); // Close 500ms after GIF disappears

    closeTimeoutsRef.current.set(presentId, closeTimeoutId);
  };

  return (
    <div className="christmas-decorations-container" aria-hidden="true">
      <div
        className={`present present-bottom-left ${openPresents.has('left') ? 'open' : ''}`}
        onClick={() => togglePresent('left')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && togglePresent('left')}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {openPresents.has('left') ? (
            <>
              <rect
                x="10"
                y="15"
                width="80"
                height="15"
                fill="#dc143c"
                rx="4"
                className="present-lid"
              />
              <rect x="45" y="15" width="10" height="15" fill="#ffd700" />
              <rect x="10" y="20" width="80" height="5" fill="#ffd700" />
              <rect
                x="10"
                y="40"
                width="80"
                height="50"
                fill="#dc143c"
                rx="4"
              />
              <rect x="45" y="40" width="10" height="50" fill="#ffd700" />
            </>
          ) : (
            <>
              <rect
                x="10"
                y="30"
                width="80"
                height="60"
                fill="#dc143c"
                rx="4"
              />
              <rect x="45" y="30" width="10" height="60" fill="#ffd700" />
              <rect x="10" y="55" width="80" height="10" fill="#ffd700" />
              <ellipse cx="35" cy="30" rx="12" ry="8" fill="#ffd700" />
              <ellipse cx="65" cy="30" rx="12" ry="8" fill="#ffd700" />
              <circle cx="50" cy="30" r="6" fill="#ffed4e" />
            </>
          )}
        </svg>
      </div>

      <div
        className={`present present-bottom-right ${openPresents.has('right') ? 'open' : ''}`}
        onClick={() => togglePresent('right')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && togglePresent('right')}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {openPresents.has('right') ? (
            <>
              <rect
                x="10"
                y="15"
                width="80"
                height="15"
                fill="#228b22"
                rx="4"
                className="present-lid"
              />
              <rect x="45" y="15" width="10" height="15" fill="#dc143c" />
              <rect x="10" y="20" width="80" height="5" fill="#dc143c" />
              <rect
                x="10"
                y="40"
                width="80"
                height="50"
                fill="#228b22"
                rx="4"
              />
              <rect x="45" y="40" width="10" height="50" fill="#dc143c" />
            </>
          ) : (
            <>
              <rect
                x="10"
                y="30"
                width="80"
                height="60"
                fill="#228b22"
                rx="4"
              />
              <rect x="45" y="30" width="10" height="60" fill="#dc143c" />
              <rect x="10" y="55" width="80" height="10" fill="#dc143c" />
              <ellipse cx="35" cy="30" rx="12" ry="8" fill="#dc143c" />
              <ellipse cx="65" cy="30" rx="12" ry="8" fill="#dc143c" />
              <circle cx="50" cy="30" r="6" fill="#ff1744" />
            </>
          )}
        </svg>
      </div>

      <div className="christmas-tree christmas-tree-top-left">
        <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
          <rect x="85" y="240" width="30" height="60" fill="#5d4037" />
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
          <polygon
            points="100,50 105,65 120,65 108,75 113,90 100,80 87,90 92,75 80,65 95,65"
            fill="#ffd700"
          />
          <circle cx="85" cy="190" r="4" fill="#dc143c" />
          <circle cx="115" cy="195" r="4" fill="#dc143c" />
          <circle cx="75" cy="150" r="4" fill="#dc143c" />
          <circle cx="125" cy="145" r="4" fill="#dc143c" />
          <circle cx="90" cy="110" r="4" fill="#dc143c" />
          <circle cx="95" cy="220" r="4" fill="#ffd700" />
          <circle cx="105" cy="215" r="4" fill="#ffd700" />
          <circle cx="80" cy="170" r="4" fill="#ffd700" />
          <circle cx="120" cy="165" r="4" fill="#ffd700" />
          <circle cx="110" cy="130" r="4" fill="#ffd700" />
          <circle cx="100" cy="230" r="4" fill="#b3e5fc" />
          <circle cx="70" cy="210" r="4" fill="#b3e5fc" />
          <circle cx="130" cy="205" r="4" fill="#b3e5fc" />
          <circle cx="85" cy="135" r="4" fill="#b3e5fc" />
          <circle cx="115" cy="115" r="4" fill="#b3e5fc" />
        </svg>
      </div>

      {activeGifs.map((gif) => (
        <div key={gif.id} className={`corner-gif corner-gif-${gif.position}`}>
          <img src={gif.url} alt="Christmas GIF" />
        </div>
      ))}
    </div>
  );
}
