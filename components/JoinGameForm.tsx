import { useState } from 'react';

export interface JoinFormData {
  displayName: string;
  isSpectator: boolean;
}

interface JoinGameFormProps {
  gameId: string;
  onSubmit: (formData: JoinFormData) => void;
}

export function JoinGameForm({ gameId, onSubmit }: JoinGameFormProps) {
  const [formState, setFormState] = useState({
    displayName: '',
    isSpectator: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formState.displayName.trim();
    if (!trimmedName) return;

    onSubmit({
      displayName: trimmedName,
      isSpectator: formState.isSpectator,
    });
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <h1 className="join-title">Join Game</h1>
        <p className="join-subtitle">
          Game ID: <span className="join-game-id">{gameId}</span>
        </p>

        <form className="join-form" onSubmit={handleSubmit}>
          <div className="join-form-group">
            <label htmlFor="username" className="join-label">
              Your name
            </label>
            <input
              id="username"
              type="text"
              value={formState.displayName}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              placeholder="Enter your name"
              className="join-input"
              autoFocus
              required
            />
          </div>
          <div className="join-form-group">
            <label className="join-toggle">
              <input
                type="checkbox"
                checked={formState.isSpectator}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    isSpectator: e.target.checked,
                  }))
                }
                className="join-toggle-input"
              />
              <span className="join-toggle-slider"></span>
              <span className="join-toggle-label">Join as spectator</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={!formState.displayName.trim()}
            className="join-button"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
