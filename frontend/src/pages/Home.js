import { useEffect, useState } from "react";
import VoteList from "../compononets/VoteList";
import VoteCreate from "../compononets/VoteCreate";

function Home () {
    const [votes, setVotes] = useState([]);

    useEffect(() => {
        fetch("/api/votes")  // connect backend server
        .then((res) => res.json())
        .then((data) => setVotes(data))
        .then((err) => console.error(err));
    }, []);

    const handleVoteCreated = (newVote) => {
        setVotes([newVote, ...votes]);
    };

    return (
        <div> 
            <h1>Vote App Home</h1>
            <VoteCreate onVoteCreated={handleVoteCreated} />
            <VoteList votes={votes} />
        </div>
    );
}

export default Home;