import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  options: [{
    text: { type: String, required: true },
    votes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }]
  }],
  isAnonymous: { 
    type: Boolean, 
    default: false 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, { 
  timestamps: true 
});

// Method to check if vote is active
voteSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

// Method to check if vote hasn't started yet
voteSchema.methods.isUpcoming = function() {
  const now = new Date();
  return now < this.startTime;
};

// Method to check if vote has ended
voteSchema.methods.hasEnded = function() {
  const now = new Date();
  return now > this.endTime;
};

const Vote = mongoose.model("Vote", voteSchema);
export default Vote;
