interface VotingCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function VotingCard({
  label,
  description,
  selected,
  onClick,
  disabled,
}: VotingCardProps) {
  const classNames = [
    "voting-card",
    selected && "voting-card-selected",
    disabled && "voting-card-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={description}
      className={classNames}
    >
      <span className="voting-card-emoji">{label}</span>
      <span className="voting-card-label">
        {description?.split("(")[0]?.trim() || ""}
      </span>
    </button>
  );
}
