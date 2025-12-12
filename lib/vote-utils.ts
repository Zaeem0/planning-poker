import { Vote } from '@/lib/store';
import { CARD_VALUES } from '@/lib/constants';

export interface CardStats {
  voteCount: number;
  percentage: number;
  isMostCommon: boolean;
  hasVotes: boolean;
}

export type AllCardStats = Record<string, CardStats>;

export interface VoteAnalysis {
  isUnanimous: boolean;
  unanimousVote: string | null;
  totalVotes: number;
}

export function getVoteForUser(
  votes: Vote[],
  userId: string
): string | undefined {
  return votes.find((v) => v.userId === userId)?.vote;
}

export function hasUnanimousVote(votes: Vote[]): boolean {
  if (votes.length === 0) return false;

  const firstVote = votes[0].vote;
  return votes.every((v) => v.vote === firstVote);
}

export function getVoteAnalysis(votes: Vote[]): VoteAnalysis {
  if (votes.length === 0) {
    return {
      isUnanimous: false,
      unanimousVote: null,
      totalVotes: 0,
    };
  }

  const firstVote = votes[0].vote;
  const isUnanimous = votes.every((v) => v.vote === firstVote);

  return {
    isUnanimous,
    unanimousVote: isUnanimous ? firstVote : null,
    totalVotes: votes.length,
  };
}

export function calculateAllCardStats(
  votes: Vote[],
  revealed: boolean
): AllCardStats {
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
