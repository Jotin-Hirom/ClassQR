
export const loginUser = async (req, res) => {};
export const googleAuth = async (req, res) => {};
export const forgotPassword = async (req, res) => {};
export const verifyOtp = async (req, res) => {};
export const resetPassword = async (req, res) => {};
export const logoutUser = async (req, res) => {};



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
