import { TeacherModel } from "../models/teacher.model.js";

/**
 * Get all teachers
 */
export const getAllTeachers = async () => {
    return await TeacherModel.getAllTeachers();
};

/**
 * Get teacher by user_id
 */
export const getTeacherById = async (user_id) => {
    return await TeacherModel.getTeacherById(user_id);
};

/**
 * Get teacher by abbr
 */
export const getTeacherByAbbr = async (abbr) => {
    return await TeacherModel.getTeacherByAbbr(abbr);
};

/**
 * Create a new teacher
 */
export const createTeacher = async (teacherData) => {
    return await TeacherModel.createTeacher(teacherData);
};

/**
 * Update teacher by user_id
 */
export const updateTeacher = async (user_id, updates) => {
    return await TeacherModel.updateTeacher(user_id, updates);
};

/**
 * Delete teacher by user_id
 */
export const deleteTeacher = async (user_id) => {
    return await TeacherModel.deleteTeacher(user_id);
};

/**
 * Get teachers by programme
 */
export const getTeachersByProgramme = async (programme) => {
    return await TeacherModel.getTeachersByProgramme(programme);
};

/**
 * Get teachers by dept
 */
export const getTeachersByDept = async (dept) => {
    return await TeacherModel.getTeachersByDept(dept);
};
