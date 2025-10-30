import { useState } from "react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Error");
        return;
      }
      // store token and user info
      localStorage.setItem("auth", JSON.stringify(data));
      // simple UI update: reload to let pages read auth from localStorage
      window.location.reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h3>{isRegister ? "Register" : "Login"}</h3>
      <form onSubmit={submit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          required
        />
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Switch to Login" : "Switch to Register"}
      </button>
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

export default LoginForm;
