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
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VotePage from "./pages/VotePage";

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
