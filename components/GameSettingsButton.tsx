'use client';

import { useState, useEffect } from 'react';
import { CardSet, CARD_PRESETS } from '@/lib/constants';
import { CardSetSelector } from './CardSetSelector';
import { GearIcon } from '@/components/icons';
import { useGameStore } from '@/lib/store';
import { Socket } from 'socket.io-client';
import '@/styles/game-settings.scss';

interface GameSettingsButtonProps {
  socket: Socket | null;
  gameId: string;
}

export function GameSettingsButton({
  socket,
  gameId,
}: GameSettingsButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { cardSet: currentCardSet } = useGameStore();
  const [cardSet, setCardSet] = useState<CardSet>({
    preset: 'tshirt',
    cards: [...CARD_PRESETS.tshirt.cards],
  });

  // Initialize with current game's card set
  useEffect(() => {
    if (currentCardSet) {
      setCardSet(currentCardSet);
    }
  }, [currentCardSet]);

  const handleUpdateSettings = () => {
    if (!socket || !gameId) return;

    // Save card set to localStorage for this game
    if (typeof window !== 'undefined') {
      localStorage.setItem(`game-${gameId}-cardset`, JSON.stringify(cardSet));
      // Also save as default preference
      localStorage.setItem('default-cardset', JSON.stringify(cardSet));
    }

    // Emit socket event to update card set for all players
    socket.emit('update-card-set', {
      gameId,
      cardSet,
    });

    setShowDialog(false);
  };

  const handleOpenDialog = () => {
    // Load current game's card set
    if (currentCardSet) {
      setCardSet(currentCardSet);
    }
    setShowDialog(true);
  };

  return (
    <>
      <button
        onClick={handleOpenDialog}
        className="game-settings-button"
        aria-label="Game settings"
        title="Change card set"
      >
        <GearIcon />
      </button>

      {showDialog && (
        <div
          className="game-settings-dialog-overlay"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="game-settings-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="game-settings-dialog-header">
              <h2 className="game-settings-dialog-title">Settings</h2>
              <button
                className="game-settings-dialog-close"
                onClick={() => setShowDialog(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="game-settings-dialog-content">
              <CardSetSelector
                initialCardSet={cardSet}
                onCardSetChange={setCardSet}
                hideHeader
              />
            </div>

            <div className="game-settings-dialog-footer">
              <button
                onClick={() => setShowDialog(false)}
                className="game-settings-dialog-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSettings}
                className="game-settings-dialog-submit"
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
