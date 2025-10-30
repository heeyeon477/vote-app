import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VoteDetail from "../components/VoteDetail";

function VotePage() {
  const { id } = useParams();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVote = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/votes/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to load vote");
        return;
      }
      
      setVote(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVote();
  }, [id]);

  const handleVoteUpdated = (updatedVote) => {
    setVote(updatedVote);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading vote details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={fetchVote} style={{ padding: "10px 20px", marginTop: "10px" }}>
          Try Again
        </button>
      </div>
    );
  }

  if (!vote) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Vote not found</p>
      </div>
    );
  }

  return (
    <div>
      <VoteDetail vote={vote} onVoteUpdated={handleVoteUpdated} />
    </div>
  );
}

export default VotePage;
