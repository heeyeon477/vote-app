import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Comment from "../models/comment.js";
import Vote from "../models/Vote.js";

const router = express.Router();

/**
 * GET /api/comments/vote/:voteId
 * 
 * Retrieves all comments for a specific vote, sorted by newest first
 * 
 * DESIGN DECISIONS:
 * - Comments are sorted newest first (createdAt: -1) for better UX
 * - Only populate author username (not email/password) for privacy
 * - Validates vote exists before fetching comments (referential integrity)
 * - No authentication required - comments are public within vote context
 */
router.get("/vote/:voteId", async (req, res) => {
  try {
    const { voteId } = req.params;
    
    // Check if vote exists
    const vote = await Vote.findById(voteId);
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    // Get comments for this vote
    const comments = await Comment.find({ vote: voteId })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new comment
router.post("/vote/:voteId", protect, async (req, res) => {
  try {
    const { voteId } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ message: "Comment must be 500 characters or less" });
    }
    
    // Check if vote exists
    const vote = await Vote.findById(voteId);
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }
    
    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      vote: voteId,
      author: req.user._id
    });
    
    // Populate author info and return
    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "username");
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment (only by author)
router.delete("/:commentId", protect, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }
    
    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a comment (only by author)
router.put("/:commentId", protect, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ message: "Comment must be 500 characters or less" });
    }
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }
    
    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content: content.trim() },
      { new: true }
    ).populate("author", "username");
    
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
