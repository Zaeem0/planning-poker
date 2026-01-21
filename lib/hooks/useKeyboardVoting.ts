import { useEffect, useRef, useCallback } from 'react';
import { CARD_VALUES } from '@/lib/constants';
import { useGameStore } from '@/lib/store';

const isDeselectKey = (key: string): boolean =>
  key === 'Escape' || key === 'Backspace';

const TWO_CHAR_TIMEOUT_MS = 1000;

interface UseKeyboardVotingOptions {
  enabled: boolean;
  onVote: (value: string) => void;
  onDeselect: () => void;
}

export function useKeyboardVoting({
  enabled,
  onVote,
  onDeselect,
}: UseKeyboardVotingOptions): void {
  const { cardSet } = useGameStore();
  const cards = cardSet?.cards || CARD_VALUES;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secondKeyListenerRef = useRef<((e: KeyboardEvent) => void) | null>(
    null
  );
  const bufferRef = useRef<string>('');

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (secondKeyListenerRef.current) {
      window.removeEventListener('keydown', secondKeyListenerRef.current, {
        capture: true,
      });
      secondKeyListenerRef.current = null;
    }
    bufferRef.current = '';
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const isTypingInFormField = (target: HTMLElement) =>
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // Build a map of keyboard shortcuts to card values
    const keyMap = new Map<string, string>();

    // Filter out "unknown" cards for sequential numbering (to match voting hint logic)
    const votableCards = cards.filter((c) => c.value !== 'unknown');

    cards.forEach((card) => {
      // Handle "unknown" card separately (always use "?" key)
      if (card.value === 'unknown') {
        return; // Skip - handled separately in the keydown handler
      }

      // Determine the actual vote value (what gets sent to the server)
      // If card.value is empty, use the label as the vote value
      const voteValue = card.value || card.label;

      // Determine what key should trigger this card
      let keyboardShortcut = card.value || card.label;

      // If value is empty, determine the shortcut based on label
      if (!card.value) {
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(card.label);
        if (isAlphanumeric && card.label) {
          keyboardShortcut = card.label;
        } else {
          // Use sequential number for non-alphanumeric labels (e.g., emojis)
          // Find the index in the votable cards array (excluding "unknown")
          const votableIndex = votableCards.findIndex((c) => c === card);
          keyboardShortcut = String(votableIndex + 1);
        }
      }

      const shortcutLower = keyboardShortcut.toLowerCase();

      // Map the full shortcut (e.g., "1w", "2w", "xs", "xl", "1", "2", "s")
      keyMap.set(shortcutLower, voteValue);

      // For single character shortcuts, map them directly (e.g., "s", "m", "l")
      if (shortcutLower.length === 1) {
        keyMap.set(shortcutLower, voteValue);
      }

      // For numeric shortcuts, map the number (e.g., "1" -> "1w", "2" -> "2w")
      if (/^\d+/.test(shortcutLower)) {
        const numMatch = shortcutLower.match(/^\d+/);
        if (numMatch) {
          keyMap.set(numMatch[0], voteValue);
        }
      }
    });

    const handleKeyboardVote = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (isTypingInFormField(e.target as HTMLElement)) return;
      if (isDeselectKey(e.key)) {
        clearPendingTimeout();
        return onDeselect();
      }

      // Handle "?" for unknown
      if (e.key === '?') {
        clearPendingTimeout();
        const unknownCard = cards.find((c) => c.value === 'unknown');
        if (unknownCard) {
          return onVote(unknownCard.value);
        }
        return;
      }

      // Add key to buffer
      bufferRef.current += key;

      // Check if buffer matches any card value
      const matchedValue = keyMap.get(bufferRef.current);

      if (matchedValue) {
        // Exact match found
        clearPendingTimeout();
        onVote(matchedValue);
        return;
      }

      // Check if buffer is a prefix of any card value
      const hasPrefix = Array.from(keyMap.keys()).some((k) =>
        k.startsWith(bufferRef.current)
      );

      if (hasPrefix) {
        // Wait for more keys
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          clearPendingTimeout,
          TWO_CHAR_TIMEOUT_MS
        );
      } else {
        // No match, clear buffer
        clearPendingTimeout();
      }
    };

    window.addEventListener('keydown', handleKeyboardVote);

    return () => {
      window.removeEventListener('keydown', handleKeyboardVote);
      clearPendingTimeout();
    };
  }, [enabled, onVote, onDeselect, clearPendingTimeout, cards]);
}
