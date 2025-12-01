interface JoinGameFormProps {
  gameId: string;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

export default function JoinGameForm({
  gameId,
  name,
  onNameChange,
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
          <button type="submit" disabled={!name.trim()} className="join-button">
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

