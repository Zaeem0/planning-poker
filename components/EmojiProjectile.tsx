import { EmojiAnimation } from '@/lib/hooks/useEmojiAnimations';

interface EmojiProjectileProps {
  animation: EmojiAnimation;
}

export function EmojiProjectile({ animation }: EmojiProjectileProps) {
  return (
    <span
      className="emoji-projectile"
      style={
        {
          animationDelay: `${animation.delay}s`,
          '--start-x': `${animation.startX}px`,
          '--start-y': `${animation.startY}px`,
          '--impact-x': `${animation.impactX}px`,
          '--impact-y': `${animation.impactY}px`,
          '--bounce-x': `${animation.bounceX}px`,
          '--bounce-y': `${animation.bounceY}px`,
          '--rotation': `${animation.rotation}deg`,
        } as React.CSSProperties
      }
    >
      {animation.emoji}
    </span>
  );
}

