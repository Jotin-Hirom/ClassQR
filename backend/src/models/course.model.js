import pool from "../config/pool.js";

export class CourseModel {
    static async getAllCourses() {
        const q = "SELECT * FROM course_offerings";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getCourseById(course_id) {
        const q = "SELECT * FROM course_offerings WHERE course_id = $1";
        const { rows } = await pool.query(q, [course_id]);
        return rows[0];
    }

    static async getCoursesByTeacher(teacher_id) {
        const q = "SELECT * FROM course_offerings WHERE teacher_id = $1";
        const { rows } = await pool.query(q, [teacher_id]);
        return rows;
    }

    static async getCoursesBySubject(sub_code) {
        const q = "SELECT * FROM course_offerings WHERE sub_code = $1";
        const { rows } = await pool.query(q, [sub_code]);
        return rows;
    }

    static async getCoursesBySemester(semester) {
        const q = "SELECT * FROM course_offerings WHERE semester = $1";
        const { rows } = await pool.query(q, [semester]);
        return rows;
    }

    static async getCoursesByProgramme(programme) {
        const q = "SELECT * FROM course_offerings WHERE programme = $1";
        const { rows } = await pool.query(q, [programme]);
        return rows;
    }

    static async createCourse({ teacher_id, sub_code, semester, programme }) {
        const q = `
            INSERT INTO course_offerings (teacher_id, sub_code, semester, programme)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [teacher_id, sub_code, semester, programme]);
        return rows[0];
    }

    static async updateCourse(course_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.teacher_id !== undefined) {
            fields.push(`teacher_id = $${paramIndex++}`);
            values.push(updates.teacher_id);
        }
        if (updates.sub_code !== undefined) {
            fields.push(`sub_code = $${paramIndex++}`);
            values.push(updates.sub_code);
        }
        if (updates.semester !== undefined) {
            fields.push(`semester = $${paramIndex++}`);
            values.push(updates.semester);
        }
        if (updates.programme !== undefined) {
            fields.push(`programme = $${paramIndex++}`);
            values.push(updates.programme);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE course_offerings
            SET ${fields.join(', ')}
            WHERE course_id = $${paramIndex}
            RETURNING *
        `;
        values.push(course_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteCourse(course_id) {
        const q = "DELETE FROM course_offerings WHERE course_id = $1";
        await pool.query(q, [course_id]);
        return true;
    }
}

// Usage example:
// import { CourseModel } from '../models/course.model.js';
//
// const example = async () => {
//   try {
//     const courses = await CourseModel.getAllCourses();
//     console.log(courses);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
