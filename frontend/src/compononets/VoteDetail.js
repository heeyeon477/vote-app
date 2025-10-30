import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";

function VoteDetail({ vote: initialVote, onVoteUpdate }) {
  const [vote, setVote] = useState(initialVote);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setVote(initialVote);
    checkIfUserVoted(initialVote);
  }, [initialVote]);

  // Auto refresh every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshVote();
    }, 5000);
    return () => clearInterval(interval);
  }, [vote._id]);

  const checkIfUserVoted = (voteData) => {
    const userId = localStorage.getItem("userId");
    if (!userId || !voteData.options) return;
    
    const voted = voteData.options.some(option => 
      option.votes.some(v => v._id === userId || v === userId)
    );
    setHasVoted(voted);
  };

  const refreshVote = async () => {
    try {
      const res = await fetch(`/api/votes/${vote._id}`);
      if (res.ok) {
        const data = await res.json();
        setVote(data);
        if (onVoteUpdate) onVoteUpdate(data);
      }
    } catch (err) {
      console.error("Failed to refresh vote:", err);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      alert("선택지를 선택해주세요");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다");
      return;
    }

    try {
      const res = await fetch(`/api/votes/${vote._id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ optionIndex: selectedOption })
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "투표에 실패했습니다");
        return;
      }

      const data = await res.json();
      setVote(data);
      setHasVoted(true);
      alert("투표가 완료되었습니다!");
      if (onVoteUpdate) onVoteUpdate(data);
    } catch (err) {
      console.error(err);
      alert("투표에 실패했습니다");
    }
  };

  const getTotalVotes = () => {
    return vote.options.reduce((sum, option) => sum + option.votes.length, 0);
  };

  const getVotePercentage = (optionVotes) => {
    const total = getTotalVotes();
    return total > 0 ? ((optionVotes / total) * 100).toFixed(1) : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    const status = vote.status;
    const styles = {
      upcoming: { backgroundColor: '#ffc107', color: '#000' },
      active: { backgroundColor: '#28a745', color: '#fff' },
      ended: { backgroundColor: '#6c757d', color: '#fff' }
    };
    const labels = {
      upcoming: '예정',
      active: '진행중',
      ended: '종료'
    };
    return (
      <span style={{ ...statusStyles.badge, ...styles[status] }}>
        {labels[status]}
      </span>
    );
  };

  if (!vote) return <p>Loading...</p>;

  const canVote = vote.status === 'active' && !hasVoted;
  const totalVotes = getTotalVotes();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{vote.title}</h2>
        {getStatusBadge()}
      </div>
      
      <p style={styles.description}>{vote.description}</p>
      
      <div style={styles.info}>
        <p><strong>작성자:</strong> {vote.createdBy?.username || 'Unknown'}</p>
        <p><strong>투표 방식:</strong> {vote.isAnonymous ? '익명' : '실명'}</p>
        <p><strong>시작 시간:</strong> {formatDate(vote.startTime)}</p>
        <p><strong>마감 시간:</strong> {formatDate(vote.endTime)}</p>
        <p><strong>총 투표 수:</strong> {totalVotes}표</p>
      </div>

      <div style={styles.options}>
        <h3>선택지</h3>
        {vote.options.map((option, index) => (
          <div key={index} style={styles.optionContainer}>
            <div style={styles.optionHeader}>
              {canVote && (
                <input
                  type="radio"
                  name="vote-option"
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  style={styles.radio}
                />
              )}
              <span style={styles.optionText}>{option.text}</span>
            </div>
            
            <div style={styles.results}>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${getVotePercentage(option.votes.length)}%`
                  }}
                />
              </div>
              <span style={styles.voteCount}>
                {option.votes.length}표 ({getVotePercentage(option.votes.length)}%)
              </span>
            </div>
            
            {!vote.isAnonymous && option.votes.length > 0 && (
              <div style={styles.voters}>
                <small>투표자: {option.votes.map(v => v.username || v).join(', ')}</small>
              </div>
            )}
          </div>
        ))}
      </div>

      {canVote && (
        <button onClick={handleVote} style={styles.voteBtn}>
          투표하기
        </button>
      )}

      {hasVoted && (
        <p style={styles.votedMsg}>✓ 투표가 완료되었습니다</p>
      )}

      {vote.status === 'upcoming' && (
        <p style={styles.upcomingMsg}>투표가 아직 시작되지 않았습니다</p>
      )}

      {vote.status === 'ended' && (
        <p style={styles.endedMsg}>투표가 종료되었습니다</p>
      )}

      <CommentSection voteId={vote._id} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  description: {
    color: "#666",
    marginBottom: "20px"
  },
  info: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px"
  },
  options: {
    marginBottom: "20px"
  },
  optionContainer: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "15px",
    marginBottom: "10px"
  },
  optionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px"
  },
  radio: {
    cursor: "pointer"
  },
  optionText: {
    fontSize: "16px",
    fontWeight: "500"
  },
  results: {
    marginBottom: "8px"
  },
  progressBar: {
    width: "100%",
    height: "24px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "5px"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
    transition: "width 0.3s ease"
  },
  voteCount: {
    fontSize: "14px",
    color: "#666"
  },
  voters: {
    marginTop: "8px",
    color: "#666"
  },
  voteBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "15px"
  },
  votedMsg: {
    color: "#28a745",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "15px"
  },
  upcomingMsg: {
    color: "#ffc107",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "15px"
  },
  endedMsg: {
    color: "#6c757d",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "15px"
  }
};

const statusStyles = {
  badge: {
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold"
  }
};

export default VoteDetail;
