import CommentSection from "./CommentSection";

function VoteDetail({ vote }) {
  return (
    <div>
      <h2>{vote.title}</h2>
      <p>{vote.description}</p>
      <CommentSection voteId={vote._id} />
    </div>
  );
}

export default VoteDetail;
