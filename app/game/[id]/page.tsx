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

const STORAGE_KEY = "planning-poker-username";

function getInitialState() {
  if (typeof window === "undefined") {
    return { name: "", hasJoined: false, showJoinForm: true };
  }

  const savedName = localStorage.getItem(STORAGE_KEY);
  const hasJoined = !!savedName;

  return {
    name: savedName || "",
    hasJoined,
    showJoinForm: !hasJoined,
  };
}

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [copied, setCopied] = useState(false);
  const initialState = getInitialState();
  const [showJoinForm, setShowJoinForm] = useState(initialState.showJoinForm);
  const [name, setName] = useState(initialState.name);
  const [hasJoined, setHasJoined] = useState(initialState.hasJoined);

  const {
    userId,
    users,
    votes,
    revealed,
    selectedVote,
    setGameId,
    setSelectedVote,
  } = useGameStore();

  const socket = useSocket(gameId, hasJoined ? name : undefined, hasJoined);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  const handleJoin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    localStorage.setItem(STORAGE_KEY, trimmedName);
    setShowJoinForm(false);
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showJoinForm) {
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
