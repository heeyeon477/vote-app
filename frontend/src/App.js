import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Votepage from "./pages/VotePage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vote/:id" elemnet={<Votepage />} />
            </Routes>
        </Router>
    );
}

export default App;