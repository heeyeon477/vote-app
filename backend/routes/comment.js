import express from "express";
const router = express.Router();

// get comments
router.get("/", (req, res) => {
  res.send("Comment List API");
});

// create comments
router.post("/", (req, res) => {
  res.send("Comment Create API");
});

export default router;
