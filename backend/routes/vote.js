import express from "express";
const router = express.Router();

// get all votes
router.get("/", (req, res) => {
  res.send("Vote List API");
});

// create vote
router.post("/", (req, res) => {
  res.send("Vote Create API");
});

// get a specific vote
router.get("/:id", (req, res) => {
  res.send(`Vote Detail API: ${req.params.id}`);
});

export default router;
