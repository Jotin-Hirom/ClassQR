import express from "express";
import {
  getAllTeachers,
  getTeacherById,
  getTeacherByAbbr,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersByProgramme,
  getTeachersByDept,
} from "../controllers/teacher.controller.js";

const router = express.Router();

// Get all teachers
router.get("/", getAllTeachers);

// Get teacher by user_id
router.get("/:user_id", getTeacherById);

// Get teacher by abbr
router.get("/abbr/:abbr", getTeacherByAbbr);

// Create a new teacher
router.post("/", createTeacher);

// Update teacher by user_id
router.put("/:user_id", updateTeacher);

// Delete teacher by user_id
router.delete("/:user_id", deleteTeacher);

// Get teachers by programme
router.get("/programme/:programme", getTeachersByProgramme);

// Get teachers by dept
router.get("/dept/:dept", getTeachersByDept);

export default router;
