/*
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VotePage from "./pages/VotePage";
import fastAPI from fastapi 

app = FastAPI()

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote/:id" element={<VotePage />} />
      </Routes>
    </Router>
  );
}

export default App;
*/
import React, { useEffect, useState } from "react";
import Home from "./pages/Home";
import VotePage from "./pages/VotePage";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // FastAPI에서 데이터 가져오기
    fetch("http://127.0.0.1:8000/") // FastAPI가 실행 중인 주소
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>Vote App</h1>
      <p>{data ? JSON.stringify(data) : "Loading..."}</p>
      <Home />
      <VotePage />
    </div>
  );
}

export default App;
