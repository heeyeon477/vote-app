import { useEffect, useState } from "react";
import VoteList from "../components/VoteList";
import LoginForm from "../components/LoginForm";
import VoteCreate from "../components/VoteCreate";

function Home() {
  const [votes, setVotes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth"));
    } catch {
      return null;
    }
  });

  const fetchVotes = async () => {
    try {
      const res = await fetch("/api/votes");
      const data = await res.json();
      setVotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    window.location.reload();
  };

  const handleVoteCreated = (newVote) => {
    setVotes([newVote, ...votes]);
    setShowCreateForm(false);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1>Vote App</h1>
      
      {/* Auth section */}
      <div style={{ marginBottom: "30px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        {auth ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0 }}>Welcome, <strong>{auth.username}</strong>!</p>
            </div>
            <div>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{ 
                  padding: "8px 16px", 
                  marginRight: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                {showCreateForm ? "Cancel" : "Create Vote"}
              </button>
              <button 
                onClick={logout}
                style={{ 
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>

      {/* Create vote form */}
      {auth && showCreateForm && (
        <VoteCreate onVoteCreated={handleVoteCreated} />
      )}

      {/* Vote list */}
      <div>
        <h2>All Votes</h2>
        <VoteList votes={votes} />
      </div>
    </div>
  );
}

export default Home;
