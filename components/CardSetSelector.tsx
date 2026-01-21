'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { CardPresetType, CARD_PRESETS, Card, CardSet } from '@/lib/constants';
import {
  MAX_LABEL_LENGTH,
  MAX_VALUE_LENGTH,
  getValidCards,
  getKeyboardShortcut,
  getDuplicateShortcuts,
} from '@/lib/card-validation';
import '@/styles/card-set-selector.scss';

interface CardSetSelectorProps {
  initialCardSet?: CardSet;
  onCardSetChange: (cardSet: CardSet) => void;
  hideHeader?: boolean;
}

const initializePresetCards = (
  preset: CardPresetType,
  initialCardSet?: CardSet
): Card[] => {
  if (initialCardSet?.preset === preset) {
    return initialCardSet.cards.map((card) => ({ ...card }));
  }
  if (preset === 'custom') {
    return [{ value: '', label: '', description: '' }];
  }
  return CARD_PRESETS[preset].cards.map((card) => ({
    value: card.value,
    label: card.label,
    description: card.description,
  }));
};

function ResetIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function CardSetSelector({
  initialCardSet,
  onCardSetChange,
  hideHeader = false,
}: CardSetSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<CardPresetType>(
    initialCardSet?.preset || 'tshirt'
  );
  const [presetCards, setPresetCards] = useState<
    Record<CardPresetType, Card[]>
  >(() => ({
    tshirt: initializePresetCards('tshirt', initialCardSet),
    fibonacci: initializePresetCards('fibonacci', initialCardSet),
    weeks: initializePresetCards('weeks', initialCardSet),
    custom: initializePresetCards('custom', initialCardSet),
  }));
  const firstCardInputRef = useRef<HTMLInputElement>(null);
  const lastCardInputRef = useRef<HTMLInputElement>(null);
  const focusTargetRef = useRef<'first' | 'last' | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentCards = presetCards[selectedPreset];

  const duplicateShortcuts = useMemo(
    () => getDuplicateShortcuts(currentCards),
    [currentCards]
  );

  const hasDuplicateShortcut = (card: Card): boolean => {
    const shortcut = getKeyboardShortcut(card);
    return shortcut !== '' && duplicateShortcuts.has(shortcut);
  };

  const handlePresetChange = (preset: CardPresetType) => {
    focusTargetRef.current = 'first';
    setSelectedPreset(preset);
    const cards = presetCards[preset];
    onCardSetChange({
      preset,
      cards: getValidCards(cards),
    });
  };

  const handleResetPreset = () => {
    focusTargetRef.current = 'first';
    const defaultCards =
      selectedPreset === 'custom'
        ? [{ value: '', label: '', description: '' }]
        : CARD_PRESETS[selectedPreset].cards.map((card) => ({
            value: card.value,
            label: card.label,
            description: card.description,
          }));
    setPresetCards((prev) => ({ ...prev, [selectedPreset]: defaultCards }));
    onCardSetChange({
      preset: selectedPreset,
      cards: getValidCards(defaultCards),
    });
  };

  const handleAddCard = () => {
    focusTargetRef.current = 'last';
    const newCards = [
      ...currentCards,
      { value: '', label: '', description: '' },
    ];
    setPresetCards((prev) => ({ ...prev, [selectedPreset]: newCards }));
    onCardSetChange({
      preset: selectedPreset,
      cards: getValidCards(newCards),
    });
  };

  useEffect(() => {
    if (focusTargetRef.current === 'first' && firstCardInputRef.current) {
      firstCardInputRef.current.focus();
    } else if (focusTargetRef.current === 'last' && lastCardInputRef.current) {
      lastCardInputRef.current.focus();
    }
    focusTargetRef.current = null;
  }, [currentCards.length, selectedPreset]);

  const handleRemoveCard = (index: number) => {
    const newCards = currentCards.filter((_, i) => i !== index);
    setPresetCards((prev) => ({ ...prev, [selectedPreset]: newCards }));
    onCardSetChange({
      preset: selectedPreset,
      cards: getValidCards(newCards),
    });
  };

  const handleCardChange = (
    index: number,
    field: keyof Card,
    value: string
  ) => {
    const newCards = [...currentCards];
    newCards[index] = { ...newCards[index], [field]: value };

    if (field === 'value' || field === 'label') {
      const card = newCards[index];
      newCards[index].description = card.value || card.label;
    }

    setPresetCards((prev) => ({ ...prev, [selectedPreset]: newCards }));
    onCardSetChange({
      preset: selectedPreset,
      cards: getValidCards(newCards),
    });
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    (document.activeElement as HTMLElement)?.blur();

    // Create a clean drag image without focus styles
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-9999px';
    dragElement.style.left = '-9999px';

    // Remove focus styling from inputs in the clone
    const inputs = dragElement.querySelectorAll('input');
    inputs.forEach((input) => {
      input.style.background = 'transparent';
      input.style.borderColor = 'transparent';
    });

    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(
      dragElement,
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );

    // Clean up the clone after drag image is captured
    setTimeout(() => dragElement.remove(), 0);

    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const newCards = [...currentCards];
      const [draggedCard] = newCards.splice(draggedIndex, 1);
      newCards.splice(dragOverIndex, 0, draggedCard);
      setPresetCards((prev) => ({ ...prev, [selectedPreset]: newCards }));
      onCardSetChange({
        preset: selectedPreset,
        cards: getValidCards(newCards),
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleInputBlur = (index: number, field: keyof Card) => {
    const card = currentCards[index];
    const trimmedValue = card[field].trim();
    if (trimmedValue !== card[field]) {
      handleCardChange(index, field, trimmedValue);
    }
  };

  const presetOptions: CardPresetType[] = [
    'tshirt',
    'fibonacci',
    'weeks',
    'custom',
  ];

  return (
    <div className="card-set-selector">
      {!hideHeader && (
        <>
          <div className="card-set-selector-divider"></div>
          <h3 className="card-set-selector-title">Card Set</h3>
        </>
      )}

      <div className="card-set-presets">
        {presetOptions.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`card-set-preset-button ${selectedPreset === preset ? 'selected' : ''}`}
            onClick={() => handlePresetChange(preset)}
          >
            {CARD_PRESETS[preset].name}
          </button>
        ))}
      </div>

      <div className="card-set-editor">
        <div className="card-set-editor-header">
          <button
            type="button"
            className="card-set-editor-reset"
            onClick={handleResetPreset}
            title="Reset to default"
          >
            <ResetIcon />
          </button>
        </div>
        <div className="card-set-editor-cards">
          {currentCards.map((card, index) => {
            const isDuplicate = hasDuplicateShortcut(card);
            const isDragging = draggedIndex === index;
            const isDragOver =
              dragOverIndex === index && draggedIndex !== index;
            return (
              <div
                key={index}
                className={`card-set-editor-card ${isDuplicate ? 'duplicate-warning' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                title={
                  isDuplicate
                    ? 'Duplicate keyboard shortcut'
                    : card.description || 'Drag to reorder'
                }
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <button
                  type="button"
                  className="card-set-editor-card-remove"
                  onClick={() => handleRemoveCard(index)}
                  aria-label="Remove card"
                  title="Remove card"
                >
                  ✕
                </button>
                <div className="card-set-editor-card-content">
                  <input
                    ref={
                      index === 0
                        ? firstCardInputRef
                        : index === currentCards.length - 1
                          ? lastCardInputRef
                          : null
                    }
                    type="text"
                    className="card-set-editor-card-label"
                    placeholder=" "
                    value={card.label}
                    onChange={(e) =>
                      handleCardChange(index, 'label', e.target.value)
                    }
                    onBlur={() => handleInputBlur(index, 'label')}
                    maxLength={MAX_LABEL_LENGTH}
                    title="Card label (emoji, text, etc.)"
                  />
                  <input
                    type="text"
                    className="card-set-editor-card-value"
                    placeholder="key"
                    value={card.value}
                    onChange={(e) =>
                      handleCardChange(index, 'value', e.target.value)
                    }
                    onBlur={() => handleInputBlur(index, 'value')}
                    maxLength={MAX_VALUE_LENGTH}
                    title="Value (keyboard shortcut)"
                  />
                </div>
              </div>
            );
          })}
          <button
            type="button"
            className="card-set-editor-add-card"
            onClick={handleAddCard}
            title="Add new card"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
