import { useState } from "react";

function VoteCreate({ onVoteCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      console.log(data);
      onVoteCreated(data);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <input
        type="text"
        placeholder="Vote Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Vote Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Create Vote</button>
    </form>
  );
}

export default VoteCreate;
