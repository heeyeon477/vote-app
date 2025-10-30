import { useState } from "react";

function VoteDetail({ vote, onVoteUpdated }) {
  const [message, setMessage] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  const submitVote = async (optionIndex) => {
    if (!auth?.token) {
      setMessage("You must be logged in to vote");
      return;
    }

    setIsVoting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/votes/${vote._id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ optionIndex }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Error submitting vote");
        setIsVoting(false);
        return;
      }

      setMessage("Vote submitted successfully!");
      // Notify parent to refresh vote data
      if (onVoteUpdated) {
        onVoteUpdated(data);
      }
    } catch (err) {
      setMessage(err.message);
    }
    setIsVoting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming": return "#ffc107";
      case "active": return "#28a745";
      case "ended": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTotalVotes = () => {
    return vote.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getVotePercentage = (optionVotes) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : Math.round((optionVotes / total) * 100);
  };

  // Check if current user has already voted
  const hasUserVoted = () => {
    if (!auth?._id) return false;
    return vote.options.some(option => 
      option.votes.some(voter => voter._id === auth._id || voter === auth._id)
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>{vote.title}</h2>
        {vote.description && <p style={{ color: "#666" }}>{vote.description}</p>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: getStatusColor(vote.status),
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {vote.status?.toUpperCase() || "UNKNOWN"}
          </span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Total votes: {getTotalVotes()}
          </span>
        </div>
        
        <div style={{ fontSize: "14px", color: "#666" }}>
          <div>Start: {formatDateTime(vote.startTime)}</div>
          <div>End: {formatDateTime(vote.endTime)}</div>
          <div>Created by: {vote.createdBy?.username || "Unknown"}</div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Options & Results</h3>
        {vote.options.map((option, index) => {
          const voteCount = option.votes.length;
          const percentage = getVotePercentage(voteCount);
          
          return (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {option.text}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {voteCount} votes ({percentage}%)
                </div>
              </div>
              
              {/* Progress bar */}
              <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: "4px", height: "8px", marginBottom: "10px" }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: "#007bff",
                    height: "100%",
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Voting button */}
              {vote.status === "active" && auth && !hasUserVoted() && (
                <button
                  onClick={() => submitVote(index)}
                  disabled={isVoting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: isVoting ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isVoting ? "not-allowed" : "pointer",
                  }}
                >
                  {isVoting ? "Voting..." : "Vote for this option"}
                </button>
              )}

              {/* Show voters (if not anonymous) */}
              {!vote.isAnonymous && voteCount > 0 && (
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                  Voted by: {option.votes.map(voter => 
                    typeof voter === 'object' ? voter.username : 'User'
                  ).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status messages */}
      {vote.status === "upcoming" && (
        <div style={{ padding: "10px", backgroundColor: "#fff3cd", borderRadius: "4px", marginBottom: "10px" }}>
          This vote hasn't started yet. It will begin on {formatDateTime(vote.startTime)}.
        </div>
      )}

      {vote.status === "ended" && (
        <div style={{ padding: "10px", backgroundColor: "#f8d7da", borderRadius: "4px", marginBottom: "10px" }}>
          This vote has ended on {formatDateTime(vote.endTime)}.
        </div>
      )}

      {vote.status === "active" && !auth && (
        <div style={{ padding: "10px", backgroundColor: "#d1ecf1", borderRadius: "4px", marginBottom: "10px" }}>
          Please log in to participate in this vote.
        </div>
      )}

      {vote.status === "active" && auth && hasUserVoted() && (
        <div style={{ padding: "10px", backgroundColor: "#d4edda", borderRadius: "4px", marginBottom: "10px" }}>
          You have already voted in this poll. Thank you for participating!
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
            color: message.includes("successfully") ? "#155724" : "#721c24",
            marginTop: "10px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default VoteDetail;
