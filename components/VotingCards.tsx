import { useMemo } from 'react';
import { Vote, useGameStore } from '@/lib/store';
import { CARD_VALUES } from '@/lib/constants';
import { calculateAllCardStats, hasUnanimousVote } from '@/lib/vote-utils';
import { getVotingCardClassName } from '@/lib/card-utils';

interface VotingCardsProps {
  votes: Vote[];
  revealed: boolean;
  selectedVote: string | null;
  onVote: (value: string) => void;
  isSpectator: boolean;
}

export function VotingCards({
  votes,
  revealed,
  selectedVote,
  onVote,
  isSpectator,
}: VotingCardsProps) {
  const { cardSet } = useGameStore();
  const cards = cardSet?.cards || CARD_VALUES;

  const allCardStats = useMemo(
    () => calculateAllCardStats(votes, revealed, cards),
    [votes, revealed, cards]
  );

  const isUnanimous = useMemo(
    () => revealed && hasUnanimousVote(votes),
    [revealed, votes]
  );

  const getVotingHint = () => {
    if (isSpectator) return null;

    // Generate hint based on card values (exclude "unknown")
    // Use label if value is empty, and only include alphanumeric values
    const cardValues = cards
      .filter((c) => c.value !== 'unknown')
      .map((c, index) => {
        // Use value if it exists, otherwise use label if alphanumeric, otherwise use index+1
        let displayValue = c.value || c.label;

        // Check if displayValue is alphanumeric (letters/numbers only)
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(displayValue);

        if (!isAlphanumeric || !displayValue) {
          // Use sequential number if not alphanumeric or empty
          displayValue = String(index + 1);
        }

        return displayValue.toUpperCase();
      })
      .filter((v) => v); // Remove any empty values

    if (cardValues.length === 0) {
      return `Click a card to vote`;
    }

    if (cardValues.length === 1) {
      return `Press ${cardValues[0]} to vote`;
    }

    if (cardValues.length === 2) {
      return `Press ${cardValues[0]} or ${cardValues[1]} to vote`;
    }

    // For 3+ cards, show all with proper grammar
    return `Press a key to vote: ${cardValues.slice(0, -1).join(', ')}, or ${cardValues[cardValues.length - 1]}`;
  };

  return (
    <div className="voting-section-bottom">
      <p className="voting-hint">{getVotingHint()}</p>
      <div
        className={`voting-cards-bottom ${isSpectator ? 'spectator-mode' : ''}`}
      >
        {cards.map((card, index) => {
          // Use label as vote value if card.value is empty
          const voteValue = card.value || card.label;

          const stats = allCardStats[voteValue] || {
            voteCount: 0,
            percentage: 0,
            isMostCommon: false,
            hasVotes: false,
          };

          const className = getVotingCardClassName(
            voteValue,
            selectedVote,
            revealed,
            stats,
            isUnanimous
          );

          const opacity = Math.min(stats.percentage, 99) / 100;
          const style =
            revealed && stats.hasVotes
              ? ({ '--vote-opacity': opacity } as React.CSSProperties)
              : undefined;

          const showPercentage = revealed && stats.hasVotes;
          const showTitle = !showPercentage && card.value !== 'unknown';

          return (
            <button
              key={`${card.value}-${card.label}-${index}`}
              className={className}
              onClick={() => !isSpectator && onVote(voteValue)}
              disabled={isSpectator}
              title={card.description}
              style={style}
              data-card-value={voteValue}
              data-card-size={voteValue}
            >
              <span className="voting-card-emoji">{card.label}</span>
              {showPercentage && (
                <span className="voting-card-percentage">
                  {stats.percentage}%
                </span>
              )}
              {showTitle && (
                <span className="voting-card-title">
                  {card.value.toUpperCase()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
