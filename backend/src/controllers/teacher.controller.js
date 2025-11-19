import { TeacherModel } from "../models/teacher.model.js";

/**
 * Get all teachers
 */
export const getAllTeachers = async (req, res, next) => {
  try {
    const { rows } = await TeacherModel.getAllTeachers();
    res.json({ teachers: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get teacher by user_id
 */
export const getTeacherById = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const teacher = await TeacherModel.getTeacherById(user_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json({ teacher });
  } catch (err) {
    next(err);
  }
};

/**
 * Get teacher by abbr
 */
export const getTeacherByAbbr = async (req, res, next) => {
  try {
    const { abbr } = req.params;
    const teacher = await TeacherModel.getTeacherByAbbr(abbr);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json({ teacher });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new teacher
 */
export const createTeacher = async (req, res, next) => {
  try {
    const teacherData = req.body;
    const newTeacher = await TeacherModel.createTeacher(teacherData);
    res.status(201).json({ teacher: newTeacher });
  } catch (err) {
    next(err);
  }
};

/**
 * Update teacher by user_id
 */
export const updateTeacher = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;
    const updatedTeacher = await TeacherModel.updateTeacher(user_id, updates);
    res.json({ teacher: updatedTeacher });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete teacher by user_id
 */
export const deleteTeacher = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    await TeacherModel.deleteTeacher(user_id);
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Get teachers by programme
 */
export const getTeachersByProgramme = async (req, res, next) => {
  try {
    const { programme } = req.params;
    const { rows } = await TeacherModel.getTeachersByProgramme(programme);
    res.json({ teachers: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Get teachers by dept
 */
export const getTeachersByDept = async (req, res, next) => {
  try {
    const { dept } = req.params;
    const { rows } = await TeacherModel.getTeachersByDept(dept);
    res.json({ teachers: rows });
  } catch (err) {
    next(err);
  }
};
