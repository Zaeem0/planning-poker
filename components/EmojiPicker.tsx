import { THROW_EMOJIS } from '@/lib/constants';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

export function EmojiPicker({ onSelectEmoji }: EmojiPickerProps) {
  return (
    <div className="emoji-picker">
      {THROW_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          className="emoji-picker-button"
          onClick={() => onSelectEmoji(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

