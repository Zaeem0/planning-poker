"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import "@/styles/home.scss";

export default function Home() {
  const router = useRouter();
  const [gameId, setGameId] = useState("");

  const createNewGame = () => {
    const newGameId = Math.random().toString(36).substring(2, 10);
    router.push(`/game/${newGameId}`);
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      router.push(`/game/${gameId.trim()}`);
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <header className="home-header">
          <h1 className="home-title">Planning Poker</h1>
          <p className="home-subtitle">Estimate together, decide faster</p>
        </header>

        <div className="home-card">
          <button onClick={createNewGame} className="home-create-button">
            Create New Game
          </button>

          <div className="home-divider">
            <span className="home-divider-text">or join existing</span>
          </div>

          <form onSubmit={joinGame} className="home-form">
            <div className="home-form-group">
              <label htmlFor="gameId" className="home-label">
                Game ID
              </label>
              <input
                type="text"
                id="gameId"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter game ID"
                className="home-input"
              />
            </div>
            <button
              type="submit"
              disabled={!gameId.trim()}
              className="home-join-button"
            >
              Join Game
            </button>
          </form>
        </div>

        <p className="home-footer">
          Share the game ID with your team to collaborate
        </p>
      </div>
    </div>
  );
}
