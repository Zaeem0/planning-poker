import { useState } from 'react';
import { CardSet, CARD_PRESETS } from '@/lib/constants';
import { CardSetSelector } from '@/components/CardSetSelector';

export interface JoinFormData {
  displayName: string;
  isSpectator: boolean;
  cardSet?: CardSet;
}

interface JoinGameFormProps {
  gameId: string;
  onSubmit: (formData: JoinFormData) => void;
  initialName?: string;
  isCreating?: boolean;
}

export function JoinGameForm({
  gameId,
  onSubmit,
  initialName = '',
  isCreating = false,
}: JoinGameFormProps) {
  const [formState, setFormState] = useState({
    displayName: initialName || '',
    isSpectator: false,
  });
  const [cardSet, setCardSet] = useState<CardSet>({
    preset: 'tshirt',
    cards: [...CARD_PRESETS.tshirt.cards],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formState.displayName.trim();
    if (!trimmedName) return;

    onSubmit({
      displayName: trimmedName,
      isSpectator: formState.isSpectator,
      ...(isCreating ? { cardSet } : {}),
    });
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <h1 className="join-title">
          {isCreating ? 'Create Game' : 'Join Game'}
        </h1>
        <p className="join-subtitle">
          Game ID: <span className="join-game-id">{gameId}</span>
        </p>

        <form className="join-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="join-form-group">
            <label htmlFor="playerName" className="join-label">
              Your name
            </label>
            <input
              id="playerName"
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
              name="playerName"
              autoComplete="nickname"
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

          {isCreating ? (
            <>
              <button
                type="submit"
                disabled={!formState.displayName?.trim()}
                className="join-button"
              >
                Create Game
              </button>
              <div className="join-divider">
                <span className="join-divider-text">Card Set</span>
              </div>
              <div className="join-form-group settings-options-container">
                <CardSetSelector
                  initialCardSet={cardSet}
                  onCardSetChange={setCardSet}
                  hideHeader
                />
              </div>
            </>
          ) : (
            <button
              type="submit"
              disabled={!formState.displayName?.trim()}
              className="join-button"
            >
              Join Game
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
