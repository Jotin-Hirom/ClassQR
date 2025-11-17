import express from "express";
const router = express.Router();

// Example endpoints
router.get("/", (req, res) => {
  res.json({ message: "Student route working" });
});

export default router;
