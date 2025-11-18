import express from "express";
import { registerUser,loginUser, refreshToken, logoutUser } from "../controllers/auth.controller.js";
const router = express.Router();

/**
 * POST /api/auth/signup
 * Body must include "role" = 'student' | 'teacher' and the required fields per role.
 */
 
// Signup (existing)
router.post("/signup", registerUser);

// Login -> returns access token + sets refresh cookie
router.post("/login", loginUser); 

// Refresh endpoint -> reads refresh cookie and returns new access token
router.post("/refresh", refreshToken);

// Logout -> revoke refresh token & clear cookie
router.post("/logout", logoutUser);

export default router;
