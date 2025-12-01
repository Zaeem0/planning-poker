"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store";
import { useSocket, emitVote, emitReveal, emitReset } from "@/lib/socket";
import PokerTable from "@/components/PokerTable";
import JoinGameForm from "@/components/JoinGameForm";
import GameHeader from "@/components/GameHeader";
import VotingCards from "@/components/VotingCards";
import Toast from "@/components/Toast";
import "@/styles/game.scss";
import "@/styles/poker-table.scss";

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState<string | undefined>(
    undefined
  );

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

  const socket = useSocket(gameId, submittedName, true);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  const handleJoin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSubmittedName(trimmedName);
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

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!userId) {
    return (
      <div className="game-page">
        <div className="join-card">
          <p>Connecting...</p>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <JoinGameForm
        gameId={gameId}
        name={name}
        onNameChange={setName}
        onSubmit={handleJoin}
      />
    );
  }

  const hasAnyVotes = users.some((u) => u.hasVoted);

  return (
    <div className="game-page">
      <div className="game-wrapper">
        <GameHeader
          gameId={gameId}
          revealed={revealed}
          hasVotes={hasAnyVotes}
          copied={copied}
          onReveal={handleReveal}
          onReset={handleReset}
          onCopyLink={handleCopyLink}
        />

        <div className="game-main-table">
          <PokerTable
            users={users}
            votes={votes}
            revealed={revealed}
            currentUserId={userId}
            socket={socket}
            gameId={gameId}
          />
        </div>
      </div>

      <VotingCards
        votes={votes}
        revealed={revealed}
        selectedVote={selectedVote}
        onVote={handleVote}
      />

      {copied && <Toast message="Link copied to clipboard" />}
    </div>
  );
}
