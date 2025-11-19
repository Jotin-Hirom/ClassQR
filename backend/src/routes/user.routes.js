import express from "express";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsersController);

// Get user by user_id
router.get("/:user_id", getUserByIdController);

// Update user by user_id
router.put("/:user_id", updateUserController);

// Delete user by user_id
router.delete("/:user_id", deleteUserController);

export default router;
