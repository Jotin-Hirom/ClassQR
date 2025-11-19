import express from "express";
import {
  getAllStudents,
  getStudentById,
  getStudentByRollNo,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByProgramme,
  getStudentsBySemester,
} from "../controllers/student.controller.js";

const router = express.Router();

// Get all students
router.get("/", getAllStudents);

// Get student by user_id
router.get("/:user_id", getStudentById);

// Get student by roll_no
router.get("/roll/:roll_no", getStudentByRollNo);

// Create a new student
router.post("/", createStudent);

// Update student by user_id
router.put("/:user_id", updateStudent);

// Delete student by user_id
router.delete("/:user_id", deleteStudent);

// Get students by programme
router.get("/programme/:programme", getStudentsByProgramme);

// Get students by semester
router.get("/semester/:semester", getStudentsBySemester);

export default router;
