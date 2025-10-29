import { Link } from "react-router-dom";

function VoteList({ votes }) {
  if (!votes.length) return <p>No votes available</p>;

  return (
    <ul>
      {votes.map((vote) => (
        <li key={vote._id}>
          <Link to={`/vote/${vote._id}`}>{vote.title}</Link>
        </li>
      ))}
    </ul>
  );
}

export default VoteList;
