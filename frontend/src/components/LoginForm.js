/*
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
*/

import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Error");
        return;
      }
      localStorage.setItem("auth", JSON.stringify(data));
      window.location.reload();
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Error");
        return;
      }
      localStorage.setItem("auth", JSON.stringify(data));
      window.location.reload();
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  return (
    <div>
      {mode === "login" ? (
        <form onSubmit={handleLogin}>
          <h3>Login</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginRight: "8px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginRight: "8px" }}
          />
          <button type="submit" style={{ marginRight: "8px" }}>Login</button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }}>Switch to Register</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <h3>Register</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ marginRight: "8px" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginRight: "8px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginRight: "8px" }}
          />
          <button type="submit" style={{ marginRight: "8px" }}>Register</button>
          <button type="button" onClick={() => { setMode("login"); setError(""); }}>Switch to Login</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      )}
    </div>
  );
}

export default LoginForm;