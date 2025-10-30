import { useState, useEffect } from "react";
import CommentSection from "./CommentSection";

function VoteDetail({ vote, onVoteUpdated }) {
  const [message, setMessage] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState(vote);

  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  useEffect(() => {
    setCurrentVote(vote);
  }, [vote]);

  useEffect(() => {
    if (currentVote?.status === "active") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/votes/${currentVote._id}`);
          const data = await res.json();
          if (res.ok) {
            setCurrentVote(data);
          }
        } catch (err) {
          console.error("Failed to refresh:", err);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentVote?._id, currentVote?.status]);

  const submitVote = async (optionIndex) => {
    if (!auth?.token) {
      setMessage("You must be logged in to vote");
      return;
    }

    setIsVoting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/votes/${currentVote._id}/vote`, {
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

      setMessage("투표가 완료되었습니다!");
      setCurrentVote(data);
      if (onVoteUpdated) {
        onVoteUpdated(data);
      }
    } catch (err) {
      setMessage(err.message);
    }
    setIsVoting(false);
  };

  const getTotalVotes = () => {
    return currentVote.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getVotePercentage = (optionVotes) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : Math.round((optionVotes / total) * 100);
  };

  const hasUserVoted = () => {
    if (!auth?._id) return false;
    return currentVote.options.some(option => 
      option.votes.some(voter => voter._id === auth._id || voter === auth._id)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming": return "#ffc107";
      case "active": return "#28a745";
      case "ended": return "#6c757d";
      default: return "#6c757d";
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2>{currentVote.title}</h2>
        {currentVote.description && (
          <p style={{ color: "#666", marginTop: "10px" }}>{currentVote.description}</p>
        )}
        
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "15px", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              backgroundColor: getStatusColor(currentVote.status),
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {currentVote.status?.toUpperCase()}
          </span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            총 투표수: {getTotalVotes()}명
          </span>
          {currentVote.status === "active" && (
            <span style={{ fontSize: "12px", color: "#28a745" }}>
              🔴 실시간 (30초마다 업데이트)
            </span>
          )}
        </div>
      </div>

      {currentVote.status === "active" && auth && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: hasUserVoted() ? "#d4edda" : "#d1ecf1", 
          borderRadius: "8px", 
          marginBottom: "20px",
          border: `1px solid ${hasUserVoted() ? "#c3e6cb" : "#bee5eb"}`
        }}>
          {hasUserVoted() ? (
            <div>
              <strong>✅ 투표 완료!</strong><br />
              <span style={{ fontSize: "14px" }}>이미 이 투표에 참여하셨습니다. 한 주제당 한 번만 투표 가능합니다.</span>
            </div>
          ) : (
            <div>
              <strong>📝 투표 참여하기</strong><br />
              <span style={{ fontSize: "14px" }}>아래 선택지 중 하나를 클릭하여 투표하세요.</span>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>실시간 결과 📊</h3>
        
        {currentVote.options.map((option, index) => {
          const voteCount = option.votes.length;
          const percentage = getVotePercentage(voteCount);
          const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
          
          return (
            <div key={index} style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>{option.text}</span>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {voteCount}표 ({percentage}%)
                </span>
              </div>
              
              <div style={{ 
                width: "100%", 
                height: "30px", 
                backgroundColor: "#e0e0e0", 
                borderRadius: "15px",
                overflow: "hidden",
                marginBottom: "10px"
              }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: colors[index % colors.length],
                    borderRadius: "15px",
                    transition: "width 0.8s ease-in-out",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {percentage > 15 && `${percentage}%`}
                </div>
              </div>

              {currentVote.status === "active" && auth && !hasUserVoted() && (
                <button
                  onClick={() => submitVote(index)}
                  disabled={isVoting}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isVoting ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isVoting ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  {isVoting ? "투표 중..." : "이 항목에 투표하기 ✓"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {currentVote.status === "upcoming" && (
        <div style={{ padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px", marginBottom: "10px" }}>
          📅 투표가 아직 시작되지 않았습니다. {new Date(currentVote.startTime).toLocaleString()}에 시작됩니다.
        </div>
      )}

      {currentVote.status === "ended" && (
        <div style={{ padding: "15px", backgroundColor: "#f8d7da", borderRadius: "8px", marginBottom: "10px" }}>
          �� 투표가 {new Date(currentVote.endTime).toLocaleString()}에 종료되었습니다.
        </div>
      )}

      {currentVote.status === "active" && !auth && (
        <div style={{ padding: "15px", backgroundColor: "#d1ecf1", borderRadius: "8px", marginBottom: "10px" }}>
          🔐 투표 참여를 위해 로그인이 필요합니다.
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: message.includes("완료") ? "#d4edda" : "#f8d7da",
            color: message.includes("완료") ? "#155724" : "#721c24",
            marginTop: "20px",
            fontWeight: "bold"
          }}
        >
          {message}
        </div>
      )}

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#666", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <div>시작: {new Date(currentVote.startTime).toLocaleString()}</div>
        <div>종료: {new Date(currentVote.endTime).toLocaleString()}</div>
        <div>생성자: {currentVote.createdBy?.username || "Unknown"}</div>
        {!currentVote.isAnonymous && <div>🔓 공개 투표 (투표자 이름 표시)</div>}
        {currentVote.isAnonymous && <div>🔒 익명 투표</div>}
      </div>

      {/* Comment Section */}
      <CommentSection voteId={currentVote._id} />
    </div>
  );
}

export default VoteDetail;
