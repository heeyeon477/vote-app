function VoteDetail({ vote }) {
  return (
    <div>
      <h2>{vote.title}</h2>
      <p>{vote.description}</p>
      {/* 댓글 등 추가 가능 */}
    </div>
  );
}

export default VoteDetail;
