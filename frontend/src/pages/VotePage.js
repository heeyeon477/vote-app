import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VoteDetail from "../components/VoteDetail";

function VotePage() {
  const { id } = useParams();
  const [vote, setVote] = useState(null);

  useEffect(() => {
    fetch(`/api/votes/${id}`)
      .then((res) => res.json())
      .then((data) => setVote(data))
      .catch((err) => console.error(err));
  }, [id]);

  return <div>{vote ? <VoteDetail vote={vote} /> : <p>Loading...</p>}</div>;
}

export default VotePage;
