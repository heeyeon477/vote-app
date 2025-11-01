import { useState } from "react";

function VoteCreate({ onVoteCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // 시간 선택 관련 상태
  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState("12");
  const [startMinute, setStartMinute] = useState("00");
  const [startAMPM, setStartAMPM] = useState("AM");
  const [endDate, setEndDate] = useState("");
  const [endHour, setEndHour] = useState("12");
  const [endMinute, setEndMinute] = useState("00");
  const [endAMPM, setEndAMPM] = useState("AM");

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

  // 시, 분 드롭다운 옵션 생성
  const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, "0"));

  // AM/PM, 시/분으로 ISO 날짜 생성
  function getDateTime(date, hour, minute, ampm) {
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return date ? `${date}T${h.toString().padStart(2, "0")}:${minute}:00` : "";
  }

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const startTime = getDateTime(startDate, startHour, startMinute, startAMPM);
    const endTime = getDateTime(endDate, endHour, endMinute, endAMPM);

    // 기존 유효성 검증
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
      setStartDate("");
      setStartHour("12");
      setStartMinute("00");
      setStartAMPM("AM");
      setEndDate("");
      setEndHour("12");
      setEndMinute("00");
      setEndAMPM("AM");
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
        {/* 시간 선택 부분 - 오전/오후, 시/분 선택 */}
        <div style={{ marginBottom: "10px" }}>
          <label>Start Time:</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              style={{ padding: "5px" }}
            />
            <select value={startHour} onChange={e => setStartHour(e.target.value)}>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            :
            <select value={startMinute} onChange={e => setStartMinute(e.target.value)}>
              {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={startAMPM} onChange={e => setStartAMPM(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>End Time:</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
              style={{ padding: "5px" }}
            />
            <select value={endHour} onChange={e => setEndHour(e.target.value)}>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            :
            <select value={endMinute} onChange={e => setEndMinute(e.target.value)}>
              {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={endAMPM} onChange={e => setEndAMPM(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: "10px 20px", backgroundColor: isSubmitting ? "#ccc" : "#007bff", color: "white", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          {isSubmitting ? "Creating..." : "Create Vote"}
        </button>
      </form>
      {message && <p style={{ color: message.includes("successfully") ? "green" : "red", marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

export default VoteCreate;
