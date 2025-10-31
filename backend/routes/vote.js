import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Vote from "../models/Vote.js";

const router = express.Router();

/**
 * GET /api/votes/best/today
 * 
 * Returns today's best/trending votes based on popularity score
 * Popularity algorithm: viewCount + (totalVotes * 3)
 * - Views are weighted 1x (passive engagement)
 * - Votes are weighted 3x (active engagement - more valuable)
 * 
 * This helps surface the most engaging content to users
 */
router.get("/best/today", async (req, res) => {
  try {
    // Create date filter for today only (from 00:00:00 to current time)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Reset to midnight
    
    // Find all votes created today and populate creator info
    const votes = await Vote.find({
      createdAt: { $gte: startOfDay }
    })
      .populate("createdBy", "username") // Only fetch username, not password/email
      .sort({ createdAt: -1 }); // Most recent first
    
    // Transform votes and calculate popularity metrics
    const votesWithScore = votes.map(vote => {
      const voteObj = vote.toObject(); // Convert Mongoose doc to plain object
      
      // Determine current vote status based on time
      if (vote.isUpcoming()) {
        voteObj.status = "upcoming"; // Not started yet
      } else if (vote.isActive()) {
        voteObj.status = "active";   // Currently accepting votes
      } else {
        voteObj.status = "ended";    // Voting period has ended
      }
      
      // Calculate total participation across all options
      const totalVotes = vote.options.reduce((sum, option) => sum + option.votes.length, 0);
      
      // POPULARITY ALGORITHM:
      // Base score from views (1 point each) + active participation (3 points each)
      // This weights actual voting more heavily than passive viewing
      voteObj.popularityScore = (vote.viewCount || 0) + (totalVotes * 3);
      voteObj.totalVotes = totalVotes;
      
      return voteObj;
    });
    
    // Sort by popularity score (highest first) and limit to top 3
    const bestVotes = votesWithScore
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 3);
    
    res.json(bestVotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
      
      // Add total votes count
      const totalVotes = vote.options.reduce((sum, option) => sum + option.votes.length, 0);
      voteObj.totalVotes = totalVotes;
      
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

/**
 * GET /api/votes/:id
 * 
 * Retrieves a specific vote by ID and increments view count
 * 
 * IMPORTANT: This automatically tracks engagement metrics by incrementing
 * viewCount each time someone views a vote. This data is used for:
 * - Analytics and trending calculations
 * - Popularity scoring in the "best votes" feature
 * - Understanding user engagement patterns
 */
router.get("/:id", async (req, res) => {
  try {
    // ATOMIC OPERATION: Find vote and increment view count in single DB operation
    // This prevents race conditions when multiple users view simultaneously
    const vote = await Vote.findByIdAndUpdate(
      req.params.id, 
      { $inc: { viewCount: 1 } }, // MongoDB $inc operator - atomic increment
      { new: true } // Return updated document, not original
    )
      .populate("createdBy", "username") // Get creator info
      .populate("options.votes", "username"); // Get voter usernames for non-anonymous votes
    
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    // Add computed status field based on current time vs vote timing
    const voteObj = vote.toObject();
    if (vote.isUpcoming()) {
      voteObj.status = "upcoming"; // Vote hasn't started yet
    } else if (vote.isActive()) {
      voteObj.status = "active";   // Vote is currently accepting submissions
    } else {
      voteObj.status = "ended";    // Vote period has concluded
    }
    
    res.json(voteObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/votes/:id/vote
 * 
 * Allows authenticated users to submit their vote for a specific option
 * 
 * BUSINESS RULES:
 * - Must be authenticated (protect middleware)
 * - Vote must be in "active" status (between startTime and endTime)
 * - User can only vote once per vote (prevents ballot stuffing)
 * - Must select a valid option index
 * 
 * SECURITY CONSIDERATIONS:
 * - User ID is taken from JWT token, not request body (prevents impersonation)
 * - Multiple validation layers prevent invalid votes
 */
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const vote = await Vote.findById(req.params.id);
    
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    // TIMING VALIDATION: Ensure vote is currently accepting submissions
    if (!vote.isActive()) {
      return res.status(400).json({ message: "This vote is not currently active" });
    }
    
    // INPUT VALIDATION: Ensure selected option exists
    if (optionIndex < 0 || optionIndex >= vote.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }
    
    // DUPLICATE VOTE PREVENTION: Check if user already voted on any option
    // This ensures one vote per user per poll (democratic principle)
    const hasVoted = vote.options.some(option => 
      option.votes.includes(req.user._id)
    );
    
    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
    
    // RECORD THE VOTE: Add user ID to the selected option's votes array
    vote.options[optionIndex].votes.push(req.user._id);
    await vote.save();
    
    // RETURN UPDATED DATA: Fetch fresh data with populated references
    // This ensures frontend gets the latest vote counts and user info
    const updatedVote = await Vote.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("options.votes", "username"); // For displaying voter names in non-anonymous votes
    
    res.json(updatedVote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
