export const googleAuth = async (req, res) => {};
export const forgotPassword = async (req, res) => {};
export const verifyOtp = async (req, res) => {};
export const resetPassword = async (req, res) => {};



// Registration controller
import { createStudentUser, createTeacherUser } from "../services/auth.service.js";

/**
 * Register user (student or teacher)
 * Expects JSON body with "role" field.
 */
export const registerUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || (role !== "student" && role !== "teacher")) {
      return res.status(400).json({ error: "role must be 'student' or 'teacher'" });
    }

    if (role === "student") {
      const result = await createStudentUser(req.body);
      return res.status(201).json({ message: "Student registered", user: result });
    } else {
      const result = await createTeacherUser(req.body);
      return res.status(201).json({ message: "Teacher registered", user: result });
    }
  } catch (err) {
    // Known errors thrown from service include { status, message }
    if (err && err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};


// Authentication controller for login, refresh, logout
import { getUserByEmail, saveRefreshToken, revokeRefreshTokenByToken, findRefreshToken , revokeAllUserRefreshTokens} from "../services/auth.service.js";
import { compareSync } from "bcryptjs";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import pool from "../config/db.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "Strict",
  // path limits cookie to refresh route if you like:
  // path: "/api/auth/refresh",
  maxAge: undefined, // we set based on REFRESH_EXPIRE when creating cookie below
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await getUserByEmail(email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.password_hash) return res.status(401).json({ error: "Complete registration via provider" });

    const valid = compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // generate tokens
    const accessToken = signAccessToken({ sub: user.user_id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.user_id });


    // compute expires_at for DB and cookie maxAge (ms)
    const refreshExpire = process.env.REFRESH_EXPIRE || "1d";
    // Convert REFRESH_EXPIRE to ms for cookie maxAge:
    const msMap = { 
      s: 1000,         // 1 second = 1000 milliseconds
      m: 60 * 1000,    // 1 minute = 60 seconds × 1000 = 60,000 ms
      h: 3600 * 1000,  // 1 hour = 3600 seconds × 1000 = 3,600,000 ms  
      d: 24 * 3600 * 1000 // 1 day = 24 hours × 3600 seconds × 1000 = 86,400,000 ms
    };
    // naive parse like "7d", "30m"
    const match = refreshExpire.match(/^(\d+)([smhd])$/);
    let cookieMaxAge = null;
    if (match) {
      const n = Number(match[1]);
      const unit = match[2];
      cookieMaxAge = n * (msMap[unit] || msMap.d);
      cookieOptions.maxAge = cookieMaxAge;
    }

    // Save refresh token in DB
    const expiresAt = new Date(Date.now() + (cookieOptions.maxAge || 1 * 24 * 3600 * 1000));
    await saveRefreshToken({
      user_id: user.user_id,
      token_hash: refreshToken,
      expires_at: expiresAt,
    });
    // await saveRefreshToken({ user_id: user.user_id, token: refreshToken, expires_at: expiresAt });

    // Set cookie
    // res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({ 
      // accessToken, expiresIn: process.env.JWT_EXPIRE || "15m", 
      user: { user_id: user.user_id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// Refresh token controller
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: "Refresh token missing" });

    // verify signature
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Lookup stored hashed token for this user
    const stored = await findRefreshToken(payload.sub);
    if (!stored) return res.status(401).json({ error: "No valid refresh token found" });

    if (new Date(stored.expires_at) < new Date()) {
      return res.status(401).json({ error: "Refresh token expired" });
    }

    // Compare hashed vs plaintext token
    const tokenMatch = await bcrypt.compare(token, stored.token_hash);
    if (!tokenMatch) return res.status(401).json({ error: "Refresh token mismatch" });

    // ROTATE TOKEN: revoke old one
    await revokeRefreshTokenByToken(stored.token_id);
     // 3. ROTATE TOKEN → revoke old + issue new refresh token
    const newRefreshToken = signRefreshToken({ sub: payload.sub });

    // Calculate expiry date
    const refreshExpire = process.env.REFRESH_EXPIRE || "7d";
    const msMap = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = refreshExpire.match(/^(\d+)([smhd])$/);
    let cookieMaxAge = 7 * 86400000;
    if (match) cookieMaxAge = Number(match[1]) * msMap[match[2]];

    const expiresAt = new Date(Date.now() + cookieMaxAge);

    // Revoke old token
    await revokeRefreshTokenByToken(token);

    // Save new token
    await saveRefreshToken({
      user_id: stored.user_id,
      token_hash: newRefreshToken,
      expires_at: expiresAt,
    });

    // Set cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: cookieMaxAge,
    });

    // All good -> issue new access token (optionally rotate refresh tokens)
    const accessToken = signAccessToken({ sub: stored.user_id, role: req.body?.role || undefined });

    return res.json({ accessToken, expiresIn: process.env.JWT_EXPIRE || "15m",rotated: true });
  } catch (err) {
    next(err);
  }
};

// Logout controller
export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      let payload;
      try {
        payload = verifyRefreshToken(refreshToken);
        await revokeAllUserRefreshTokens(payload.sub);
      } catch (e) {
        // ignore invalid token — just clear cookie
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};



// Me controller
export const me = async (req, res, next) => {
  try {
    const userId = req.user.user_id;   // added by verifyToken middleware
    const role = req.user.role;

    // 1. Fetch base user info
    const userQuery = `
      SELECT user_id, email, role, created_at
      FROM users
      WHERE user_id = $1
      LIMIT 1
    `;
    const userRes = await pool.query(userQuery, [userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Load profile based on role
    let profile = null;

    if (role === "student") {
      const q = `
        SELECT user_id, roll_no, sname, semester, programme, batch, photo_url
        FROM students
        WHERE user_id = $1
        LIMIT 1
      `;
      const r = await pool.query(q, [userId]);
      profile = r.rows[0] || {};
    }

    if (role === "teacher") {
      const q = `
        SELECT user_id, abbr, tname, designation, specialization, dept, programme, photo_url
        FROM teachers
        WHERE user_id = $1
        LIMIT 1
      `;
      const r = await pool.query(q, [userId]);
      profile = r.rows[0] || {};
    }

    // Admins don't have separate profile tables — return basic data only

    return res.json({
      user,
      profile,
    });

  } catch (err) {
    next(err);
  }
};

