import { StudentModel } from "../models/student.model.js";

/**
 * Get all students
 */
export const getAllStudents = async (req, res, next) => {
  try {
    const { rows } = await StudentModel.getAllStudents();
    res.json({ students: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get student by user_id
 */
export const getStudentById = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const student = await StudentModel.getStudentById(user_id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

/**
 * Get student by roll_no
 */
export const getStudentByRollNo = async (req, res, next) => {
  try {
    const { roll_no } = req.params;
    const student = await StudentModel.getStudentByRollNo(roll_no);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new student
 */
export const createStudent = async (req, res, next) => {
  try {
    const studentData = req.body;
    const newStudent = await StudentModel.createStudent(studentData);
    res.status(201).json({ student: newStudent });
  } catch (err) {
    next(err);
  }
};

/**
 * Update student by user_id
 */
export const updateStudent = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;
    const updatedStudent = await StudentModel.updateStudent(user_id, updates);
    res.json({ student: updatedStudent });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete student by user_id
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    await StudentModel.deleteStudent(user_id);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Get students by programme
 */
export const getStudentsByProgramme = async (req, res, next) => {
  try {
    const { programme } = req.params;
    const { rows } = await StudentModel.getStudentsByProgramme(programme);
    res.json({ students: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get students by semester
 */
export const getStudentsBySemester = async (req, res, next) => {
  try {
    const { semester } = req.params;
    const { rows } = await StudentModel.getStudentsBySemester(semester);
    res.json({ students: rows });
  } catch (err) {
    next(err);
  }
};
