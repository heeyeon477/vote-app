import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  vote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vote",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
commentSchema.index({ vote: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;