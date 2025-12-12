import { useMemo } from 'react';
import { CARD_VALUES, VoteSize } from '@/lib/constants';
import { Vote } from '@/lib/store';
import { calculateAllCardStats, CardStats } from '@/lib/vote-utils';

interface VotingCardsProps {
  votes: Vote[];
  revealed: boolean;
  selectedVote: string | null;
  onVote: (value: string) => void;
  isSpectator?: boolean;
}

function getCardClassName(
  cardValue: string,
  selectedVote: string | null,
  revealed: boolean,
  stats: CardStats
): string {
  const classes = ['voting-card-small'];

  if (!revealed && selectedVote === cardValue) {
    classes.push('selected');
  }
  if (revealed && stats.isMostCommon) {
    classes.push('most-common');
  }
  if (revealed && stats.hasVotes && !stats.isMostCommon) {
    classes.push('has-votes');
  }
  if (revealed && !stats.hasVotes) {
    classes.push('no-votes');
  }

  return classes.join(' ');
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
          const className = getCardClassName(
            card.value,
            selectedVote,
            revealed,
            stats
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
