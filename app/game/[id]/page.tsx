"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useGameStore } from "@/lib/store";
import { useSocket, emitVote, emitReveal, emitReset } from "@/lib/socket";
import PokerTable from "@/components/PokerTable";
import JoinGameForm from "@/components/JoinGameForm";
import GameHeader from "@/components/GameHeader";
import VotingCards from "@/components/VotingCards";
import Toast from "@/components/Toast";
import Loader from "@/components/Loader";
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

  const handleVote = useCallback(
    (value: string) => {
      setSelectedVote(value);
      if (socket && userId) {
        emitVote(socket, gameId, userId, value);
      }
    },
    [socket, userId, gameId, setSelectedVote]
  );

  useEffect(() => {
    if (!username || revealed) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const validVotes = ["xs", "s", "m", "l", "xl"];

      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Handle unknown vote with ?
      if (e.key === "?") {
        handleVote("unknown");
        return;
      }

      // Handle single character votes
      if (validVotes.includes(key)) {
        handleVote(key);
        return;
      }

      // Handle two-character votes (xs, xl)
      if (key === "x") {
        const handleSecondKey = (e2: KeyboardEvent) => {
          const secondKey = e2.key.toLowerCase();
          if (secondKey === "s") {
            handleVote("xs");
          } else if (secondKey === "l") {
            handleVote("xl");
          }
          window.removeEventListener("keydown", handleSecondKey);
        };

        window.addEventListener("keydown", handleSecondKey);
        setTimeout(() => {
          window.removeEventListener("keydown", handleSecondKey);
        }, 1000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [username, revealed, handleVote]);

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
        // Fallback for localhost
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        // Expected only used in insecure contexts (e.g. http://)
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
    return <Loader />;
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
