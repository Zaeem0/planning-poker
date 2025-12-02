import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

const PROJECTILE_COUNT = 8;
const ANIMATION_DURATION_MS = 1500;

export interface EmojiAnimation {
  id: number;
  emoji: string;
  targetUserId: string;
  delay: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
}

interface EmojiThrownEvent {
  targetUserId: string;
  emoji: string;
}

function createAnimations(
  targetUserId: string,
  emoji: string
): EmojiAnimation[] {
  const baseId = Date.now();
  const animations: EmojiAnimation[] = [];

  for (let i = 0; i < PROJECTILE_COUNT; i++) {
    animations.push({
      id: baseId + i + Math.random(),
      emoji,
      targetUserId,
      delay: i * 0.08,
      startX: Math.random() * 500 - 250,
      startY: Math.random() * 300 - 150,
      endX: Math.random() * 120 - 60,
      endY: Math.random() * 80 - 40,
      rotation: Math.random() * 720 - 360,
    });
  }

  return animations;
}

interface UseEmojiAnimationsResult {
  animations: EmojiAnimation[];
  getAnimationsForUser: (userId: string) => EmojiAnimation[];
}

export function useEmojiAnimations(
  socket: Socket | null
): UseEmojiAnimationsResult {
  const [animations, setAnimations] = useState<EmojiAnimation[]>([]);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const timeouts = timeoutsRef.current;

    const handleEmojiThrown = ({ targetUserId, emoji }: EmojiThrownEvent) => {
      const newAnimations = createAnimations(targetUserId, emoji);
      setAnimations((prev) => [...prev, ...newAnimations]);

      const timeoutId = setTimeout(() => {
        setAnimations((prev) =>
          prev.filter((a) => !newAnimations.find((n) => n.id === a.id))
        );
        timeouts.delete(timeoutId);
      }, ANIMATION_DURATION_MS);

      timeouts.add(timeoutId);
    };

    socket.on('emoji-thrown', handleEmojiThrown);

    return () => {
      socket.off('emoji-thrown', handleEmojiThrown);
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
    };
  }, [socket]);

  const getAnimationsForUser = useCallback(
    (userId: string) => animations.filter((a) => a.targetUserId === userId),
    [animations]
  );

  return { animations, getAnimationsForUser };
}
