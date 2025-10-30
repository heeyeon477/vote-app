import { Link } from "react-router-dom";

function VoteList({ votes }) {
  if (!votes.length) return <p style={styles.noVotes}>투표가 없습니다</p>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { label: '예정', color: '#ffc107', textColor: '#000' },
      active: { label: '진행중', color: '#28a745', textColor: '#fff' },
      ended: { label: '종료', color: '#6c757d', textColor: '#fff' }
    };
    
    const config = statusConfig[status] || statusConfig.ended;
    
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: config.color,
        color: config.textColor
      }}>
        {config.label}
      </span>
    );
  };

  const getTotalVotes = (vote) => {
    if (!vote.options) return 0;
    return vote.options.reduce((sum, option) => sum + (option.votes?.length || 0), 0);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>투표 목록</h2>
      <div style={styles.list}>
        {votes.map((vote) => (
          <Link 
            key={vote._id} 
            to={`/vote/${vote._id}`} 
            style={styles.card}
            className="vote-card"
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.voteTitle}>{vote.title}</h3>
              {getStatusBadge(vote.status)}
            </div>
            
            {vote.description && (
              <p style={styles.description}>
                {vote.description.length > 100 
                  ? vote.description.substring(0, 100) + '...' 
                  : vote.description}
              </p>
            )}
            
            <div style={styles.metadata}>
              <span style={styles.metaItem}>
                👤 {vote.createdBy?.username || 'Unknown'}
              </span>
              <span style={styles.metaItem}>
                🗳️ {getTotalVotes(vote)}표
              </span>
              <span style={styles.metaItem}>
                {vote.isAnonymous ? '🔒 익명' : '👁️ 실명'}
              </span>
            </div>
            
            <div style={styles.timeInfo}>
              <small style={styles.time}>
                시작: {formatDate(vote.startTime)}
              </small>
              <small style={styles.time}>
                마감: {formatDate(vote.endTime)}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px"
  },
  title: {
    marginBottom: "20px",
    color: "#333"
  },
  noVotes: {
    textAlign: "center",
    color: "#666",
    padding: "40px"
  },
  list: {
    display: "grid",
    gap: "15px"
  },
  card: {
    display: "block",
    padding: "20px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px"
  },
  voteTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#333",
    flex: 1
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    marginLeft: "10px"
  },
  description: {
    color: "#666",
    marginBottom: "15px",
    fontSize: "14px"
  },
  metadata: {
    display: "flex",
    gap: "15px",
    marginBottom: "10px",
    flexWrap: "wrap"
  },
  metaItem: {
    fontSize: "14px",
    color: "#555"
  },
  timeInfo: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #eee",
    paddingTop: "10px",
    marginTop: "10px"
  },
  time: {
    fontSize: "12px",
    color: "#888"
  }
};

export default VoteList;
