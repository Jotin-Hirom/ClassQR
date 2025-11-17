import express from "express";
import { registerUser } from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * Body must include "role" = 'student' | 'teacher' and the required fields per role.
 */
router.post("/signup", registerUser);

export default router;
