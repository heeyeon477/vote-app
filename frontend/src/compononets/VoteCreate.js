import { useState } from "react";

function VoteCreate({ onVoteCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validate options
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to create a vote");
        return;
      }
      
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          description, 
          options: validOptions,
          isAnonymous,
          startTime,
          endTime
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Failed to create vote");
        return;
      }
      
      const data = await res.json();
      onVoteCreated(data);
      
      // Reset form
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      setIsAnonymous(false);
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error(err);
      alert("Failed to create vote");
    }
  };

  return (
    <form onSubmit={handleCreate} style={styles.form}>
      <h2>투표 만들기</h2>
      
      <div style={styles.field}>
        <label>제목 (Title)</label>
        <input
          type="text"
          placeholder="투표 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label>설명 (Description)</label>
        <textarea
          placeholder="투표 설명을 입력하세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.field}>
        <label>선택지 (Options) - 최소 2개</label>
        {options.map((option, index) => (
          <div key={index} style={styles.optionRow}>
            <input
              type="text"
              placeholder={`선택지 ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
              style={styles.input}
            />
            {options.length > 2 && (
              <button 
                type="button" 
                onClick={() => handleRemoveOption(index)}
                style={styles.removeBtn}
              >
                삭제
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddOption} style={styles.addBtn}>
          + 선택지 추가
        </button>
      </div>

      <div style={styles.field}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          익명 투표 (Anonymous Voting)
        </label>
      </div>

      <div style={styles.field}>
        <label>시작 시간 (Start Time)</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label>마감 시간 (End Time)</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <button type="submit" style={styles.submitBtn}>투표 만들기</button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  },
  field: {
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  textarea: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    minHeight: "80px"
  },
  optionRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "8px"
  },
  removeBtn: {
    padding: "8px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  addBtn: {
    padding: "8px 12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "8px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default VoteCreate;
