import { useMemo } from 'react';
import { CARD_VALUES, VoteSize } from '@/lib/constants';
import { Vote } from '@/lib/store';
import { calculateAllCardStats, hasUnanimousVote } from '@/lib/vote-utils';
import { getVotingCardClassName } from '@/lib/card-utils';

interface VotingCardsProps {
  votes: Vote[];
  revealed: boolean;
  selectedVote: string | null;
  onVote: (value: string) => void;
  isSpectator?: boolean;
}

export function VotingCards({
  votes,
  revealed,
  selectedVote,
  onVote,
  isSpectator = false,
}: VotingCardsProps) {
  const allStats = useMemo(
    () => calculateAllCardStats(votes, revealed),
    [votes, revealed]
  );

  const isUnanimous = useMemo(
    () => revealed && hasUnanimousVote(votes),
    [revealed, votes]
  );

  const canVote = !revealed && !isSpectator;

  return (
    <div className="voting-section-bottom">
      {!isSpectator && (
        <p className="voting-hint">
          Press a key to vote: XS, S, M, L, XL, or ? for unknown
        </p>
      )}
      <div className="voting-cards-bottom">
        {CARD_VALUES.map((card) => {
          const stats = allStats[card.value];
          const className = getVotingCardClassName(
            card.value,
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
          const showTitle = !showPercentage && card.value !== VoteSize.UNKNOWN;

          return (
            <button
              key={card.value}
              className={className}
              onClick={() => canVote && onVote(card.value)}
              style={style}
              data-card-size={card.value}
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
