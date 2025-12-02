export const VoteSize = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
  UNKNOWN: 'unknown',
} as const;

export type VoteSizeValue = (typeof VoteSize)[keyof typeof VoteSize];

export const CARD_VALUES: ReadonlyArray<{
  value: VoteSizeValue;
  label: string;
  description: string;
}> = [
  { value: VoteSize.XS, label: '🐜', description: 'Extra Small (< 1 day)' },
  { value: VoteSize.S, label: '🐰', description: 'Small (1 - 2 days)' },
  { value: VoteSize.M, label: '🐶', description: 'Medium (1 week)' },
  { value: VoteSize.L, label: '🦒', description: 'Large (2 weeks)' },
  { value: VoteSize.XL, label: '🦕', description: 'Extra Large (2+ weeks)' },
  { value: VoteSize.UNKNOWN, label: '❓', description: 'Unknown' },
];

export const SINGLE_KEY_VOTES = [VoteSize.S, VoteSize.M, VoteSize.L] as const;

export const THROW_EMOJIS = ['🥊', '🪃', '🪨', '✈️'];

export function getVoteLabel(voteValue: string): string {
  const card = CARD_VALUES.find((c) => c.value === voteValue);
  return card ? card.label : voteValue;
}
