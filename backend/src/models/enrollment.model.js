import pool from "../config/pool.js";

export class EnrollmentModel {
    static async getAllEnrollments() {
        const q = "SELECT * FROM student_enrollments";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getEnrollmentById(enrollment_id) {
        const q = "SELECT * FROM student_enrollments WHERE enrollment_id = $1";
        const { rows } = await pool.query(q, [enrollment_id]);
        return rows[0];
    }

    static async getEnrollmentsByStudent(student_id) {
        const q = "SELECT * FROM student_enrollments WHERE student_id = $1";
        const { rows } = await pool.query(q, [student_id]);
        return rows;
    }

    static async getEnrollmentsByCourse(course_id) {
        const q = "SELECT * FROM student_enrollments WHERE course_id = $1";
        const { rows } = await pool.query(q, [course_id]);
        return rows;
    }

    static async createEnrollment({ student_id, course_id }) {
        const q = `
            INSERT INTO student_enrollments (student_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT (student_id, course_id) DO NOTHING
            RETURNING *
        `;
        const { rows } = await pool.query(q, [student_id, course_id]);
        return rows[0];
    }

    static async deleteEnrollment(enrollment_id) {
        const q = "DELETE FROM student_enrollments WHERE enrollment_id = $1";
        await pool.query(q, [enrollment_id]);
        return true;
    }

    static async deleteEnrollmentByStudentAndCourse(student_id, course_id) {
        const q = "DELETE FROM student_enrollments WHERE student_id = $1 AND course_id = $2";
        await pool.query(q, [student_id, course_id]);
        return true;
    }

    static async checkEnrollment(student_id, course_id) {
        const q = "SELECT * FROM student_enrollments WHERE student_id = $1 AND course_id = $2";
        const { rows } = await pool.query(q, [student_id, course_id]);
        return rows.length > 0;
    }
}

// Usage example:
// import { EnrollmentModel } from '../models/enrollment.model.js';
//
// const example = async () => {
//   try {
//     const enrollments = await EnrollmentModel.getAllEnrollments();
//     console.log(enrollments);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
