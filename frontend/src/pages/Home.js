import { useEffect, useState } from "react";
import VoteList from "../components/VoteList";
import LoginForm from "../components/LoginForm";

function Home() {
  const [votes, setVotes] = useState([]);
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetch("/api/votes") // connect backend server
      .then((res) => res.json())
      .then((data) => setVotes(data))
      .catch((err) => console.error(err));
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    window.location.reload();
  };

  return (
    <div>
      <h1>Vote App Home</h1>
      {auth ? (
        <div>
          <p>Logged in as {auth.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm />
      )}
      <VoteList votes={votes} />
    </div>
  );
}

export default Home;
