import { CARD_VALUES } from '@/lib/constants';
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

function calculateCardStats(
  cardValue: string,
  votes: Vote[],
  revealed: boolean
): CardStats {
  if (!revealed) {
    return {
      voteCount: 0,
      percentage: 0,
      isMostCommon: false,
      hasVotes: false,
    };
  }

  const voteCount = votes.filter((v) => v.vote === cardValue).length;
  const percentage =
    votes.length > 0 ? Math.round((voteCount / votes.length) * 100) : 0;
  const maxVotes = Math.max(
    ...CARD_VALUES.map((c) => votes.filter((v) => v.vote === c.value).length)
  );
  const isMostCommon = voteCount > 0 && voteCount === maxVotes;

  return { voteCount, percentage, isMostCommon, hasVotes: voteCount > 0 };
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

export default function VotingCards({
  votes,
  revealed,
  selectedVote,
  onVote,
}: VotingCardsProps) {
  return (
    <div className="voting-section-bottom">
      <div className="voting-cards-bottom">
        {CARD_VALUES.map((card) => {
          const stats = calculateCardStats(card.value, votes, revealed);
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
          const showTitle = !showPercentage && card.value !== 'unknown';

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
