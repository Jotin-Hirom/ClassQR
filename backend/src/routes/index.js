import express from "express";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import teacherRoutes from "./teacher.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All API base routes
router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);
router.use("/attendance", attendanceRoutes);

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
