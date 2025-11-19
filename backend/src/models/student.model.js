import pool from "../config/pool.js";
export class StudentModel {
    static async getAllStudents() {
        return await pool.query("SELECT * FROM students");
    }

    static async getStudentById(user_id) {
        const q = "SELECT * FROM students WHERE user_id = $1";
        const { rows } = await pool.query(q, [user_id]);
        return rows[0];
    }

    static async getStudentByRollNo(roll_no) {
        const q = "SELECT * FROM students WHERE roll_no = $1";
        const { rows } = await pool.query(q, [roll_no]);
        return rows[0];
    }

    static async createStudent({ user_id, roll_no, sname, semester, programme, batch, photo_url }) {
        const q = `
            INSERT INTO students (user_id, roll_no, sname, semester, programme, batch, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [user_id, roll_no, sname, semester, programme, batch, photo_url]);
        return rows[0];
    }

    static async updateStudent(user_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.sname !== undefined) {
            fields.push(`sname = $${paramIndex++}`);
            values.push(updates.sname);
        }
        if (updates.semester !== undefined) {
            fields.push(`semester = $${paramIndex++}`);
            values.push(updates.semester);
        }
        if (updates.programme !== undefined) {
            fields.push(`programme = $${paramIndex++}`);
            values.push(updates.programme);
        }
        if (updates.batch !== undefined) {
            fields.push(`batch = $${paramIndex++}`);
            values.push(updates.batch);
        }
        if (updates.photo_url !== undefined) {
            fields.push(`photo_url = $${paramIndex++}`);
            values.push(updates.photo_url);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE students
            SET ${fields.join(', ')}
            WHERE user_id = $${paramIndex}
            RETURNING *
        `;
        values.push(user_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteStudent(user_id) {
        const q = "DELETE FROM students WHERE user_id = $1";
        await pool.query(q, [user_id]);
        return true;
    }

    static async getStudentsByProgramme(programme) {
        const q = "SELECT * FROM students WHERE programme = $1";
        const { rows } = await pool.query(q, [programme]);
        return rows;
    }

    static async getStudentsBySemester(semester) {
        const q = "SELECT * FROM students WHERE semester = $1";
        const { rows } = await pool.query(q, [semester]);
        return rows;
    }
}

// Usage example of class StudentModel:
// import { StudentModel } from '../models/student.model.js';
// const example = async () => {
//   try {
//     const students = await StudentModel.getAllStudents();
//     console.log(students.rows);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
