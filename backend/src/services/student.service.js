import { StudentModel } from "../models/student.model.js";

/**
 * Get all students
 */
export const getAllStudents = async () => {
    return await StudentModel.getAllStudents();
};

/**
 * Get student by user_id
 */
export const getStudentById = async (user_id) => {
    return await StudentModel.getStudentById(user_id);
};

/**
 * Get student by roll_no
 */
export const getStudentByRollNo = async (roll_no) => {
    return await StudentModel.getStudentByRollNo(roll_no);
};

/**
 * Create a new student
 */
export const createStudent = async (studentData) => {
    return await StudentModel.createStudent(studentData);
};

/**
 * Update student by user_id
 */
export const updateStudent = async (user_id, updates) => {
    return await StudentModel.updateStudent(user_id, updates);
};

/**
 * Delete student by user_id
 */
export const deleteStudent = async (user_id) => {
    return await StudentModel.deleteStudent(user_id);
};

/**
 * Get students by programme
 */
export const getStudentsByProgramme = async (programme) => {
    return await StudentModel.getStudentsByProgramme(programme);
};

/**
 * Get students by semester
 */
export const getStudentsBySemester = async (semester) => {
    return await StudentModel.getStudentsBySemester(semester);
};
