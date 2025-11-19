import pool from "../config/pool.js";

export class AttendanceModel {
    static async getAllAttendance() {
        const q = "SELECT * FROM attendance";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getAttendanceById(attendance_id) {
        const q = "SELECT * FROM attendance WHERE attendance_id = $1";
        const { rows } = await pool.query(q, [attendance_id]);
        return rows[0];
    }

    static async getAttendanceByScanId(scan_id) {
        const q = "SELECT * FROM attendance WHERE scan_id = $1";
        const { rows } = await pool.query(q, [scan_id]);
        return rows[0];
    }

    static async createAttendance({ scan_id, student_id, course_id, status, scanned_time, photo_url, location_scanned_from, date }) {
        const q = `
            INSERT INTO attendance (scan_id, student_id, course_id, status, scanned_time, photo_url, location_scanned_from, date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [scan_id, student_id, course_id, status, scanned_time, photo_url, location_scanned_from, date]);
        return rows[0];
    }

    static async updateAttendance(attendance_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(updates.status);
        }
        if (updates.scanned_time !== undefined) {
            fields.push(`scanned_time = $${paramIndex++}`);
            values.push(updates.scanned_time);
        }
        if (updates.photo_url !== undefined) {
            fields.push(`photo_url = $${paramIndex++}`);
            values.push(updates.photo_url);
        }
        if (updates.location_scanned_from !== undefined) {
            fields.push(`location_scanned_from = $${paramIndex++}`);
            values.push(updates.location_scanned_from);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE attendance
            SET ${fields.join(', ')}
            WHERE attendance_id = $${paramIndex}
            RETURNING *
        `;
        values.push(attendance_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteAttendance(attendance_id) {
        const q = "DELETE FROM attendance WHERE attendance_id = $1";
        await pool.query(q, [attendance_id]);
        return true;
    }

    static async getAttendanceByStudent(student_id) {
        const q = "SELECT * FROM attendance WHERE student_id = $1";
        const { rows } = await pool.query(q, [student_id]);
        return rows;
    }

    static async getAttendanceByCourse(course_id) {
        const q = "SELECT * FROM attendance WHERE course_id = $1";
        const { rows } = await pool.query(q, [course_id]);
        return rows;
    }

    static async getAttendanceByDate(date) {
        const q = "SELECT * FROM attendance WHERE date = $1";
        const { rows } = await pool.query(q, [date]);
        return rows;
    }

    static async getAttendanceByStudentAndCourse(student_id, course_id) {
        const q = "SELECT * FROM attendance WHERE student_id = $1 AND course_id = $2";
        const { rows } = await pool.query(q, [student_id, course_id]);
        return rows;
    }
}

// Usage example:
// import { AttendanceModel } from '../models/attendance.model.js';
//
// const example = async () => {
//   try {
//     const attendance = await AttendanceModel.getAllAttendance();
//     console.log(attendance);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };