"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store";
import { useSocket, emitVote, emitReveal, emitReset } from "@/lib/socket";
import { CARD_VALUES } from "@/lib/constants";
import VotingCard from "@/components/VotingCard";
import UserList from "@/components/UserList";
import GameControls from "@/components/GameControls";
import Results from "@/components/Results";
import "@/styles/game.scss";
import "@/styles/voting-cards.scss";

const STORAGE_KEY = "planning-poker-username";

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [customName, setCustomName] = useState("");
  const [finalUsername, setFinalUsername] = useState<string | undefined>(
    undefined
  );
  const [hasJoined, setHasJoined] = useState(false);

  const {
    userId,
    username,
    users,
    votes,
    revealed,
    selectedVote,
    setGameId,
    setSelectedVote,
  } = useGameStore();

  const socket = useSocket(gameId, finalUsername, hasJoined);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY);
    if (savedUsername) {
      setCustomName(savedUsername);
      setFinalUsername(savedUsername);
      setShowNameDialog(false);
      setHasJoined(true);
    }
    setIsLoading(false);
  }, []);

  const handleJoinGame = () => {
    const enteredName = customName.trim();
    if (!enteredName) return;
    localStorage.setItem(STORAGE_KEY, enteredName);
    setFinalUsername(enteredName);
    setShowNameDialog(false);
    setHasJoined(true);
  };

  const handleVote = (value: string) => {
    setSelectedVote(value);
    if (socket && userId) {
      emitVote(socket, gameId, userId, value);
    }
  };

  const handleReveal = () => {
    if (socket) emitReveal(socket, gameId);
  };

  const handleReset = () => {
    if (socket) emitReset(socket, gameId);
  };

  const copyGameLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasVotes = users.some((u) => u.hasVoted);

  if (isLoading) {
    return null;
  }

  if (showNameDialog) {
    return (
      <div className="join-page">
        <div className="join-card">
          <h1 className="join-title">Join Game</h1>
          <p className="join-subtitle">
            Game ID: <span className="join-game-id">{gameId}</span>
          </p>

          <form
            className="join-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinGame();
            }}
          >
            <div className="join-form-group">
              <label htmlFor="username" className="join-label">
                Your name
              </label>
              <input
                id="username"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter your name"
                className="join-input"
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              disabled={!customName.trim()}
              className="join-button"
            >
              Join Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-wrapper">
        <header className="game-header">
          <div className="game-header-left">
            <h1 className="game-header-title">Planning Poker</h1>
            <p className="game-header-user">
              Playing as <span>{username}</span>
            </p>
          </div>
          <div className="game-header-actions">
            <GameControls
              revealed={revealed}
              onReveal={handleReveal}
              onReset={handleReset}
              hasVotes={hasVotes}
            />
            <button onClick={copyGameLink} className="game-id-badge">
              <span className="game-id-label">Game:</span>
              <span className="game-id-value">{gameId}</span>
              <svg
                className={`game-id-icon ${
                  copied ? "game-id-icon-copied" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {copied ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </header>

        <div className="game-main">
          <div className="game-content">
            <section className="voting-section">
              <h2 className="voting-title">Select your estimate</h2>
              <div className="voting-cards">
                {CARD_VALUES.map((card) => (
                  <VotingCard
                    key={card.value}
                    label={card.label}
                    description={card.description}
                    selected={selectedVote === card.value}
                    onClick={() => handleVote(card.value)}
                    disabled={revealed}
                  />
                ))}
              </div>
            </section>

            <Results votes={votes} revealed={revealed} />
          </div>

          <aside>
            <UserList
              users={users}
              votes={votes}
              revealed={revealed}
              currentUserId={userId}
              socket={socket}
              gameId={gameId}
            />
          </aside>
        </div>
      </div>

      {copied && (
        <div className="toast">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Link copied to clipboard
        </div>
      )}
    </div>
  );
}
