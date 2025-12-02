import { useState, useEffect } from 'react';
import { User, Vote } from '@/lib/store';
import { CARD_VALUES } from '@/lib/constants';
import { Socket } from 'socket.io-client';
import { emitThrowEmoji } from '@/lib/socket';
import '@/styles/poker-table.scss';

const THROW_EMOJIS = ['🪃', '🏒', '🥢', '✈️'];

interface EmojiAnimation {
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

interface PokerTableProps {
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentUserId: string;
  socket: Socket | null;
  gameId: string;
}

export function PokerTable({
  users,
  votes,
  revealed,
  currentUserId,
  socket,
  gameId,
}: PokerTableProps) {
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [emojiAnimations, setEmojiAnimations] = useState<EmojiAnimation[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleEmojiThrown = ({
      targetUserId,
      emoji,
    }: {
      targetUserId: string;
      emoji: string;
    }) => {
      const baseId = Date.now();
      const projectileCount = 8;
      const newAnimations: EmojiAnimation[] = [];

      for (let i = 0; i < projectileCount; i++) {
        newAnimations.push({
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

      setEmojiAnimations((prev) => [...prev, ...newAnimations]);

      setTimeout(() => {
        setEmojiAnimations((prev) =>
          prev.filter((a) => !newAnimations.find((n) => n.id === a.id))
        );
      }, 1500);
    };

    socket.on('emoji-thrown', handleEmojiThrown);
    return () => {
      socket.off('emoji-thrown', handleEmojiThrown);
    };
  }, [socket]);

  const handleThrowEmoji = (targetUserId: string, emoji: string) => {
    emitThrowEmoji(socket, gameId, targetUserId, emoji);
    setHoveredUserId(null);
  };

  const getAnimationsForUser = (userId: string) =>
    emojiAnimations.filter((a) => a.targetUserId === userId);

  const getVoteForUser = (userId: string) =>
    votes.find((v) => v.userId === userId)?.vote;

  const getVoteLabel = (voteValue: string) => {
    const card = CARD_VALUES.find((c) => c.value === voteValue);
    return card ? card.label : voteValue;
  };

  const topUsers = users.filter((_, i) => i % 2 === 0);
  const bottomUsers = users.filter((_, i) => i % 2 === 1);

  const renderUserCard = (user: User) => {
    const vote = getVoteForUser(user.id);
    const isCurrentUser = user.id === currentUserId;
    const hasVoted = user.hasVoted;
    const isHovered = hoveredUserId === user.id;
    const userAnimations = getAnimationsForUser(user.id);
    const isDisconnected = !user.connected;

    return (
      <div
        key={user.id}
        className="table-player"
        onMouseEnter={() => !isCurrentUser && setHoveredUserId(user.id)}
        onMouseLeave={() => setHoveredUserId(null)}
      >
        <div
          className={`player-card ${hasVoted ? 'player-card-voted' : ''} ${
            revealed && vote ? 'player-card-revealed' : ''
          } ${isDisconnected ? 'player-card-disconnected' : ''}`}
        >
          {isDisconnected ? (
            <div className="player-card-content">
              <span className="player-card-emoji">🔌</span>
            </div>
          ) : revealed && vote ? (
            <div className="player-card-content">
              <span className="player-card-emoji">{getVoteLabel(vote)}</span>
              {vote !== 'unknown' && (
                <span className="player-card-size">{vote.toUpperCase()}</span>
              )}
            </div>
          ) : (
            <span className="player-card-back"></span>
          )}
          {userAnimations.map((anim) => (
            <span
              key={anim.id}
              className="emoji-projectile"
              style={
                {
                  animationDelay: `${anim.delay}s`,
                  '--start-x': `${anim.startX}px`,
                  '--start-y': `${anim.startY}px`,
                  '--end-x': `${anim.endX}px`,
                  '--end-y': `${anim.endY}px`,
                  '--rotation': `${anim.rotation}deg`,
                } as React.CSSProperties
              }
            >
              {anim.emoji}
            </span>
          ))}
        </div>
        {isHovered && !isCurrentUser ? (
          <div className="emoji-picker">
            {THROW_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-picker-button"
                onClick={() => handleThrowEmoji(user.id, emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <span className="player-name">
            {user.username}
            {isCurrentUser && <span className="player-you">(you)</span>}
          </span>
        )}
      </div>
    );
  };

  const getTableMessage = () => {
    const votedCount = users.filter((u) => u.hasVoted).length;
    if (revealed) return 'Votes revealed!';
    if (votedCount === 0) return 'Pick your cards!';
    if (votedCount === users.length) return 'All voted! Ready to reveal';
    return `${votedCount} of ${users.length} voted`;
  };

  return (
    <div className="poker-table-container">
      <div className="table-players table-players-top">
        {topUsers.map(renderUserCard)}
      </div>

      <div className="poker-table">
        <div className="table-surface">
          <span className="table-message">{getTableMessage()}</span>
        </div>
      </div>

      <div className="table-players table-players-bottom">
        {bottomUsers.map(renderUserCard)}
      </div>
    </div>
  );
}
