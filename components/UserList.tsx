import { useState, useEffect } from "react";
import { User, Vote } from "@/lib/store";
import { CARD_VALUES } from "@/lib/constants";
import { Socket } from "socket.io-client";
import { emitThrowEmoji, emitRemoveUser } from "@/lib/socket";
import "@/styles/user-list.scss";

const THROW_EMOJIS = ["🪃", "🏒", "🥢", "✈️"];

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

interface UserListProps {
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentUserId: string;
  socket: Socket | null;
  gameId: string;
}

export default function UserList({
  users,
  votes,
  revealed,
  currentUserId,
  socket,
  gameId,
}: UserListProps) {
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
        const id = baseId + i + Math.random();
        newAnimations.push({
          id,
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

    socket.on("emoji-thrown", handleEmojiThrown);
    return () => {
      socket.off("emoji-thrown", handleEmojiThrown);
    };
  }, [socket]);

  const handleThrowEmoji = (targetUserId: string, emoji: string) => {
    emitThrowEmoji(socket, gameId, targetUserId, emoji);
    setHoveredUserId(null);
  };

  const handleRemoveUser = (targetUserId: string) => {
    emitRemoveUser(socket, gameId, targetUserId, currentUserId);
    setHoveredUserId(null);
  };

  const currentUser = users.find((u) => u.id === currentUserId);
  const isAdmin = currentUser?.isAdmin || false;

  const getVoteForUser = (userId: string) =>
    votes.find((v) => v.userId === userId)?.vote;

  const getVoteLabel = (voteValue: string) => {
    const card = CARD_VALUES.find((c) => c.value === voteValue);
    return card ? card.label : voteValue;
  };

  const getVoteStatusClass = (user: User, vote: string | undefined) => {
    if (revealed && vote) return "vote-status vote-status-revealed";
    if (user.hasVoted) return "vote-status vote-status-voted";
    return "vote-status vote-status-waiting";
  };

  const getAnimationsForUser = (userId: string) =>
    emojiAnimations.filter((a) => a.targetUserId === userId);

  return (
    <div className="user-list">
      <h2 className="user-list-title">Players ({users.length})</h2>
      <div className="user-list-items">
        {users.map((user) => {
          const vote = getVoteForUser(user.id);
          const isCurrentUser = user.id === currentUserId;
          const userAnimations = getAnimationsForUser(user.id);

          return (
            <div
              key={user.id}
              className={`user-item ${
                isCurrentUser ? "user-item-current" : ""
              }`}
              onMouseEnter={() => !isCurrentUser && setHoveredUserId(user.id)}
              onMouseLeave={() => setHoveredUserId(null)}
            >
              <div className="user-info">
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">
                  {user.username}
                  {user.isAdmin && (
                    <span className="user-admin-badge" title="Admin">
                      👑
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="user-you-badge">(you)</span>
                  )}
                  {userAnimations.map((anim) => (
                    <span
                      key={anim.id}
                      className="emoji-projectile"
                      style={{
                        animationDelay: `${anim.delay}s`,
                        ["--start-x" as string]: `${anim.startX}px`,
                        ["--start-y" as string]: `${anim.startY}px`,
                        ["--end-x" as string]: `${anim.endX}px`,
                        ["--end-y" as string]: `${anim.endY}px`,
                        ["--rotation" as string]: `${anim.rotation}deg`,
                      }}
                    >
                      {anim.emoji}
                    </span>
                  ))}
                </span>
              </div>

              {hoveredUserId === user.id && !isCurrentUser && (
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
                  {isAdmin && (
                    <button
                      className="emoji-picker-button remove-user-button"
                      onClick={() => handleRemoveUser(user.id)}
                      title="Remove user"
                    >
                      ❌
                    </button>
                  )}
                </div>
              )}

              {hoveredUserId !== user.id && (
                <div className={getVoteStatusClass(user, vote)}>
                  {revealed && vote
                    ? getVoteLabel(vote)
                    : user.hasVoted
                    ? "✓"
                    : "—"}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {users.length === 0 && <p className="user-list-empty">No players yet</p>}
    </div>
  );
}
