import { useState } from "react";

function VoteCreate({ onVoteCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    // Validation
    const nonEmptyOptions = options.filter(opt => opt.trim());
    if (nonEmptyOptions.length < 2) {
      setMessage("At least 2 options are required");
      setIsSubmitting(false);
      return;
    }
    if (!startTime || !endTime) {
      setMessage("Start and end times are required");
      setIsSubmitting(false);
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setMessage("End time must be after start time");
      setIsSubmitting(false);
      return;
    }

    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      if (!auth?.token) {
        setMessage("You must be logged in to create a vote");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          options: nonEmptyOptions,
          isAnonymous,
          startTime,
          endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Error creating vote");
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      setIsAnonymous(false);
      setStartTime("");
      setEndTime("");
      setMessage("Vote created successfully!");
      if (onVoteCreated) onVoteCreated(data);
    } catch (err) {
      setMessage(err.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ margin: "20px 0", padding: "20px", border: "1px solid #ccc" }}>
      <h3>Create New Vote</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Vote title"
            required
            style={{ width: "100%", padding: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vote description (optional)"
            style={{ width: "100%", padding: "5px", height: "60px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Options:</label>
          {options.map((option, index) => (
            <div key={index} style={{ display: "flex", marginBottom: "5px" }}>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                style={{ flex: 1, padding: "5px" }}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  style={{ marginLeft: "5px", padding: "5px 10px" }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            style={{ padding: "5px 10px" }}
          >
            Add Option
          </button>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Anonymous voting
          </label>
        </div>
        {/* 시간 선택 부분 - 알람 스타일 UI */}
        <div style={{ marginBottom: "10px" }}>
          <label>Start Time:</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={{ width: "100%", padding: "5px", fontSize: "1.1em", color: "#0066cc" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>End Time:</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            style={{ width: "100%", padding: "5px", fontSize: "1.1em", color: "#cc6600" }}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "10px 20px",
            backgroundColor: isSubmitting ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Creating..." : "Create Vote"}
        </button>
      </form>
      {message && (
        <p
          style={{
            color: message.includes("successfully") ? "green" : "red",
            marginTop: "10px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default VoteCreate;