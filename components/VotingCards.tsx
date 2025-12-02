import { useMemo } from 'react';
import { CARD_VALUES, VoteSize } from '@/lib/constants';
import { Vote } from '@/lib/store';

interface VotingCardsProps {
  votes: Vote[];
  revealed: boolean;
  selectedVote: string | null;
  onVote: (value: string) => void;
}

interface CardStats {
  voteCount: number;
  percentage: number;
  isMostCommon: boolean;
  hasVotes: boolean;
}

type AllCardStats = Record<string, CardStats>;

function calculateAllCardStats(votes: Vote[], revealed: boolean): AllCardStats {
  if (!revealed) {
    const emptyStats: CardStats = {
      voteCount: 0,
      percentage: 0,
      isMostCommon: false,
      hasVotes: false,
    };
    return Object.fromEntries(CARD_VALUES.map((c) => [c.value, emptyStats]));
  }

  const voteCounts = new Map<string, number>();
  for (const vote of votes) {
    voteCounts.set(vote.vote, (voteCounts.get(vote.vote) || 0) + 1);
  }

  const maxVotes = Math.max(0, ...voteCounts.values());

  return Object.fromEntries(
    CARD_VALUES.map((card) => {
      const voteCount = voteCounts.get(card.value) || 0;
      const percentage =
        votes.length > 0 ? Math.round((voteCount / votes.length) * 100) : 0;
      const isMostCommon = voteCount > 0 && voteCount === maxVotes;

      return [
        card.value,
        { voteCount, percentage, isMostCommon, hasVotes: voteCount > 0 },
      ];
    })
  );
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
}: VotingCardsProps) {
  const allStats = useMemo(
    () => calculateAllCardStats(votes, revealed),
    [votes, revealed]
  );

  return (
    <div className="voting-section-bottom">
      <p className="voting-hint">
        Press a key to vote: XS, S, M, L, XL, or ? for unknown
      </p>
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
              onClick={() => !revealed && onVote(card.value)}
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
