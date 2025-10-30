import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Vote from "../models/Vote.js";

const router = express.Router();

// get all votes
router.get("/", async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    
    // Add status to each vote
    const votesWithStatus = votes.map(vote => {
      const voteObj = vote.toObject();
      if (vote.isUpcoming()) {
        voteObj.status = "upcoming";
      } else if (vote.isActive()) {
        voteObj.status = "active";
      } else {
        voteObj.status = "ended";
      }
      return voteObj;
    });
    
    res.json(votesWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create vote
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, options, isAnonymous, startTime, endTime } = req.body;
    
    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({ message: "At least 2 options are required" });
    }
    
    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time" });
    }
    
    // Create vote with options
    const formattedOptions = options.map(opt => ({
      text: opt,
      votes: []
    }));
    
    const vote = await Vote.create({
      title,
      description,
      options: formattedOptions,
      isAnonymous: isAnonymous || false,
      startTime: start,
      endTime: end,
      createdBy: req.user._id
    });
    
    const populatedVote = await Vote.findById(vote._id).populate("createdBy", "username");
    res.status(201).json(populatedVote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get a specific vote
router.get("/:id", async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("options.votes", "username");
    
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    const voteObj = vote.toObject();
    if (vote.isUpcoming()) {
      voteObj.status = "upcoming";
    } else if (vote.isActive()) {
      voteObj.status = "active";
    } else {
      voteObj.status = "ended";
    }
    
    res.json(voteObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// submit a vote
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const vote = await Vote.findById(req.params.id);
    
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    // Check if vote is active
    if (!vote.isActive()) {
      return res.status(400).json({ message: "This vote is not currently active" });
    }
    
    // Check if option index is valid
    if (optionIndex < 0 || optionIndex >= vote.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }
    
    // Check if user has already voted
    const hasVoted = vote.options.some(option => 
      option.votes.includes(req.user._id)
    );
    
    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
    
    // Add user's vote
    vote.options[optionIndex].votes.push(req.user._id);
    await vote.save();
    
    // Return updated vote with populated data
    const updatedVote = await Vote.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("options.votes", "username");
    
    res.json(updatedVote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
