import { useEffect, useRef, useCallback } from 'react';
import { VoteSize, SINGLE_KEY_VOTES, VoteSizeValue } from '@/lib/constants';

const isSingleKeyVote = (key: string): key is VoteSizeValue =>
  (SINGLE_KEY_VOTES as readonly string[]).includes(key);

const TWO_CHAR_TIMEOUT_MS = 1000;

interface UseKeyboardVotingOptions {
  enabled: boolean;
  onVote: (value: VoteSizeValue) => void;
}

export function useKeyboardVoting({
  enabled,
  onVote,
}: UseKeyboardVotingOptions): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secondKeyListenerRef = useRef<((e: KeyboardEvent) => void) | null>(
    null
  );

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
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const isTypingInFormField = (target: HTMLElement) =>
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    const handleTwoCharacterVote = (firstKey: string) => {
      if (firstKey !== 'x') return;

      clearPendingTimeout();

      const waitForSecondKey = (e: KeyboardEvent) => {
        e.stopImmediatePropagation();
        const secondKey = e.key.toLowerCase();
        if (secondKey === 's') onVote(VoteSize.XS);
        else if (secondKey === 'l') onVote(VoteSize.XL);
        clearPendingTimeout();
      };

      secondKeyListenerRef.current = waitForSecondKey;
      window.addEventListener('keydown', waitForSecondKey, { capture: true });

      timeoutRef.current = setTimeout(clearPendingTimeout, TWO_CHAR_TIMEOUT_MS);
    };

    const handleKeyboardVote = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (isTypingInFormField(e.target as HTMLElement)) return;
      if (e.key === '?') return onVote(VoteSize.UNKNOWN);
      if (isSingleKeyVote(key)) return onVote(key);
      handleTwoCharacterVote(key);
    };

    window.addEventListener('keydown', handleKeyboardVote);

    return () => {
      window.removeEventListener('keydown', handleKeyboardVote);
      clearPendingTimeout();
    };
  }, [enabled, onVote, clearPendingTimeout]);
}
