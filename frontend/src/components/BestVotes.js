import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BestVotes() {
  const [bestVotes, setBestVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestVotes = async () => {
      try {
        const res = await fetch("/api/votes/best/today");
        const data = await res.json();
        if (res.ok) {
          setBestVotes(data);
        } else {
          console.error("Failed to fetch best votes:", data.message);
        }
      } catch (error) {
        console.error("Error fetching best votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestVotes();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming": return "#ffc107";
      case "active": return "#28a745";
      case "ended": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "🏆";
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return "#FFD700";
      case 1: return "#C0C0C0";
      case 2: return "#CD7F32";
      default: return "#007bff";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
        오늘의 베스트 투표를 불러오는 중...
      </div>
    );
  }

  if (bestVotes.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "40px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "12px",
        border: "2px dashed #dee2e6"
      }}>
        <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>🌟 오늘의 베스트 투표</h3>
        <p style={{ color: "#999", margin: 0 }}>아직 오늘 생성된 투표가 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "30px", 
        color: "#333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
      }}>
        🌟 오늘의 베스트 투표 TOP {bestVotes.length}
      </h2>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: bestVotes.length === 1 ? "1fr" : bestVotes.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
        gap: "20px",
        marginBottom: "20px"
      }}>
        {bestVotes.map((vote, index) => (
          <div
            key={vote._id}
            onClick={() => navigate(`/vote/${vote._id}`)}
            style={{
              background: `linear-gradient(145deg, ${getRankColor(index)}15, ${getRankColor(index)}05)`,
              border: `2px solid ${getRankColor(index)}40`,
              borderRadius: "16px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
            }}
          >
            {/* Rank Badge */}
            <div style={{
              position: "absolute",
              top: "-10px",
              left: "20px",
              backgroundColor: getRankColor(index),
              color: "white",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              {getRankIcon(index)} {index + 1}위
            </div>

            {/* Vote Title */}
            <h3 style={{ 
              marginTop: "15px",
              marginBottom: "10px", 
              color: "#333",
              fontSize: "18px",
              lineHeight: "1.3"
            }}>
              {vote.title}
            </h3>

            {/* Vote Description */}
            {vote.description && (
              <p style={{ 
                color: "#666", 
                fontSize: "14px",
                marginBottom: "15px",
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {vote.description}
              </p>
            )}

            {/* Status and Stats */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  backgroundColor: getStatusColor(vote.status),
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {vote.status?.toUpperCase()}
              </span>
              
              <div style={{ fontSize: "12px", color: "#666" }}>
                👁️ {vote.viewCount || 0} · 🗳️ {vote.totalVotes || 0}
              </div>
            </div>

            {/* Popularity Score */}
            <div style={{ 
              textAlign: "center",
              padding: "10px",
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.1)"
            }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>
                인기점수
              </div>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "bold", 
                color: getRankColor(index)
              }}>
                {vote.popularityScore || 0}
              </div>
            </div>

            {/* Creator */}
            <div style={{ 
              marginTop: "10px", 
              fontSize: "12px", 
              color: "#999",
              textAlign: "center"
            }}>
              by {vote.createdBy?.username || "Unknown"}
            </div>
          </div>
        ))}
      </div>

      {/* Info text */}
      <div style={{ 
        textAlign: "center", 
        fontSize: "12px", 
        color: "#999",
        fontStyle: "italic"
      }}>
        * 인기점수 = 조회수 + (투표수 × 3) 기준으로 계산됩니다
      </div>
    </div>
  );
}

export default BestVotes;