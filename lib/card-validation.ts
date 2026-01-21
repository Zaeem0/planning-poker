import { Card } from '@/lib/constants';

export const MAX_LABEL_LENGTH = 10;
export const MAX_VALUE_LENGTH = 10;

export function getValidCards(cards: Card[]): Card[] {
  return cards.filter((card) => card.label.trim() !== '');
}

export function getKeyboardShortcut(card: Card): string {
  if (card.value) return card.value.toLowerCase();
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(card.label);
  return isAlphanumeric ? card.label.toLowerCase() : '';
}

export function getDuplicateShortcuts(cards: Card[]): Set<string> {
  const shortcuts = new Map<string, number>();
  const duplicates = new Set<string>();

  cards.forEach((card) => {
    if (!card.label.trim()) return;
    const shortcut = getKeyboardShortcut(card);
    if (!shortcut) return;

    const count = shortcuts.get(shortcut) || 0;
    shortcuts.set(shortcut, count + 1);
    if (count > 0) duplicates.add(shortcut);
  });

  return duplicates;
}

