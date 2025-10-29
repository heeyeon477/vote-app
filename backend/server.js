import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import voteRoutes from "./routes/vote.js";
import commentRoutes from "./routes/comment.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// connect router
app.use("/api/auth", authRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
