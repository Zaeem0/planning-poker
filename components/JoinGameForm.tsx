interface JoinGameFormProps {
  gameId: string;
  name: string;
  isSpectator: boolean;
  onNameChange: (name: string) => void;
  onSpectatorChange: (isSpectator: boolean) => void;
  onSubmit: () => void;
}

export function JoinGameForm({
  gameId,
  name,
  isSpectator,
  onNameChange,
  onSpectatorChange,
  onSubmit,
}: JoinGameFormProps) {
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
            onSubmit();
          }}
        >
          <div className="join-form-group">
            <label htmlFor="username" className="join-label">
              Your name
            </label>
            <input
              id="username"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
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
                checked={isSpectator}
                onChange={(e) => onSpectatorChange(e.target.checked)}
                className="join-toggle-input"
              />
              <span className="join-toggle-slider"></span>
              <span className="join-toggle-label">Join as spectator</span>
            </label>
          </div>
          <button type="submit" disabled={!name.trim()} className="join-button">
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
