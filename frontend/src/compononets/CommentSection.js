import { useState, useEffect } from "react";

function CommentSection({ voteId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`/api/comments?voteId=${voteId}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error(err));
  }, [voteId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteId, text }),
      });
      const newComment = await res.json();
      setComments([...comments, newComment]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((c) => (
          <li key={c._id}>{c.text}</li>
        ))}
      </ul>
      <form onSubmit={handleAddComment}>
        <input
          type="text"
          placeholder="Add a comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}

export default CommentSection;
