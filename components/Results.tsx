import { Vote } from "@/lib/store";
import { CARD_VALUES } from "@/lib/constants";
import "@/styles/results.scss";

interface ResultsProps {
  votes: Vote[];
  revealed: boolean;
}

export default function Results({ votes, revealed }: ResultsProps) {
  if (!revealed || votes.length === 0) return null;

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.vote] = (acc[vote.vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonVote = Object.entries(voteCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const getVoteLabel = (voteValue: string) => {
    const card = CARD_VALUES.find((c) => c.value === voteValue);
    return card ? card.label : voteValue;
  };

  const getVoteDescription = (voteValue: string) => {
    const card = CARD_VALUES.find((c) => c.value === voteValue);
    return card ? card.description : voteValue;
  };

  return (
    <section className="results">
      <h2 className="results-title">Results</h2>

      {mostCommonVote && (
        <div className="results-highlight">
          <div className="results-highlight-label">Most Common</div>
          <div className="results-highlight-content">
            <div className="results-highlight-emoji">
              {getVoteLabel(mostCommonVote[0])}
            </div>
            <div className="results-highlight-text">
              <h3>{getVoteDescription(mostCommonVote[0])}</h3>
              <p>
                {mostCommonVote[1]} vote{mostCommonVote[1] !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="results-distribution-title">Distribution</h3>
      <div className="results-distribution">
        {Object.entries(voteCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([vote, count]) => (
            <div key={vote} className="results-distribution-item">
              <div className="results-distribution-emoji">
                {getVoteLabel(vote)}
              </div>
              <div className="results-distribution-info">
                <div className="results-distribution-header">
                  <span className="results-distribution-label">
                    {getVoteDescription(vote)}
                  </span>
                  <span className="results-distribution-count">
                    {count} ({Math.round((count / votes.length) * 100)}%)
                  </span>
                </div>
                <div className="results-progress-bar">
                  <div
                    className="results-progress-fill"
                    style={{ width: `${(count / votes.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
