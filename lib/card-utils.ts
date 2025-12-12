import { CardStats } from '@/lib/vote-utils';

export function getVotingCardClassName(
  cardValue: string,
  selectedVote: string | null,
  revealed: boolean,
  stats: CardStats,
  isUnanimous = false
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
  if (revealed && isUnanimous && stats.percentage === 100) {
    classes.push('unanimous');
  }

  return classes.join(' ');
}
