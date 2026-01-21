// Card configuration types
export interface Card {
  value: string;
  label: string;
  description: string;
}

export type CardPresetType = 'tshirt' | 'fibonacci' | 'weeks' | 'custom';

export interface CardSet {
  preset: CardPresetType;
  cards: Card[];
}

// Legacy VoteSize for backward compatibility
export const VoteSize = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
  UNKNOWN: 'unknown',
} as const;

export type VoteSizeValue = (typeof VoteSize)[keyof typeof VoteSize];

// T-shirt sizing preset (default)
export const TSHIRT_CARDS: ReadonlyArray<Card> = [
  { value: 'xs', label: '🐜', description: 'Extra Small (< 1 day)' },
  { value: 's', label: '🐰', description: 'Small (1 - 2 days)' },
  { value: 'm', label: '🐶', description: 'Medium (1 week)' },
  { value: 'l', label: '🦒', description: 'Large (2 weeks)' },
  { value: 'xl', label: '🦕', description: 'Extra Large (2+ weeks)' },
  { value: 'unknown', label: '❓', description: 'Unknown' },
];

// Fibonacci sequence preset
export const FIBONACCI_CARDS: ReadonlyArray<Card> = [
  { value: '1', label: '1️⃣', description: '1 point' },
  { value: '2', label: '2️⃣', description: '2 points' },
  { value: '3', label: '3️⃣', description: '3 points' },
  { value: '5', label: '5️⃣', description: '5 points' },
  { value: '8', label: '8️⃣', description: '8 points' },
  { value: '13', label: '1️⃣3️⃣', description: '13 points' },
  { value: 'unknown', label: '❓', description: 'Unknown' },
];

// Week-based preset
export const WEEKS_CARDS: ReadonlyArray<Card> = [
  { value: '1w', label: '1️⃣', description: '1 week' },
  { value: '2w', label: '2️⃣', description: '2 weeks' },
  { value: '3w', label: '3️⃣', description: '3 weeks' },
  { value: '4w', label: '4️⃣', description: '4 weeks' },
  { value: '5w', label: '5️⃣', description: '4 weeks' },
  { value: '6w', label: '6️⃣', description: '6 weeks' },
  { value: 'unknown', label: '❓', description: 'Unknown' },
];

// Default card values (for backward compatibility)
export const CARD_VALUES = TSHIRT_CARDS;

// Card presets configuration
export const CARD_PRESETS: Record<
  CardPresetType,
  { name: string; cards: ReadonlyArray<Card> }
> = {
  tshirt: {
    name: 'T-Shirts',
    cards: TSHIRT_CARDS,
  },
  fibonacci: {
    name: 'Fibonacci',
    cards: FIBONACCI_CARDS,
  },
  weeks: {
    name: 'Weeks',
    cards: WEEKS_CARDS,
  },
  custom: {
    name: 'Custom',
    cards: [],
  },
};

export const SINGLE_KEY_VOTES = [VoteSize.S, VoteSize.M, VoteSize.L] as const;

export const THROW_EMOJIS = ['🥊', '🪃', '🪨', '✈️'];

export function getVoteLabel(
  voteValue: string,
  cards: ReadonlyArray<Card> = CARD_VALUES
): string {
  const card = cards.find((c) => c.value === voteValue);
  return card ? card.label : voteValue;
}
