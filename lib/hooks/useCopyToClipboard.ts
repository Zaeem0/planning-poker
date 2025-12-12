import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/lib/clipboard';

interface UseCopyToClipboardResult {
  copied: boolean;
  handleCopyLink: () => Promise<void>;
}

export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return { copied, handleCopyLink };
}

