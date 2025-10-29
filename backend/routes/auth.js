import express from "express";
const router = express.Router();

// sign in
router.post("/login", (req, res) => {
  res.send("Login API");
});

// sign up
router.post("/register", (req, res) => {
  res.send("Register API");
});

export default router;
