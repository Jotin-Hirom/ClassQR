import pool from "../config/pool.js";

export class TeacherModel {
    static async getAllTeachers() {
        const q = "SELECT * FROM teachers";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getTeacherById(user_id) {
        const q = "SELECT * FROM teachers WHERE user_id = $1";
        const { rows } = await pool.query(q, [user_id]);
        return rows[0];
    }

    static async getTeacherByAbbr(abbr) {
        const q = "SELECT * FROM teachers WHERE abbr = $1";
        const { rows } = await pool.query(q, [abbr]);
        return rows[0];
    }

    static async createTeacher({ user_id, abbr, tname, designation, specialization, dept, programme, photo_url }) {
        const q = `
            INSERT INTO teachers (user_id, abbr, tname, designation, specialization, dept, programme, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [user_id, abbr, tname, designation, specialization, dept, programme, photo_url]);
        return rows[0];
    }

    static async updateTeacher(user_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.abbr !== undefined) {
            fields.push(`abbr = $${paramIndex++}`);
            values.push(updates.abbr);
        }
        if (updates.tname !== undefined) {
            fields.push(`tname = $${paramIndex++}`);
            values.push(updates.tname);
        }
        if (updates.designation !== undefined) {
            fields.push(`designation = $${paramIndex++}`);
            values.push(updates.designation);
        }
        if (updates.specialization !== undefined) {
            fields.push(`specialization = $${paramIndex++}`);
            values.push(updates.specialization);
        }
        if (updates.dept !== undefined) {
            fields.push(`dept = $${paramIndex++}`);
            values.push(updates.dept);
        }
        if (updates.programme !== undefined) {
            fields.push(`programme = $${paramIndex++}`);
            values.push(updates.programme);
        }
        if (updates.photo_url !== undefined) {
            fields.push(`photo_url = $${paramIndex++}`);
            values.push(updates.photo_url);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE teachers
            SET ${fields.join(', ')}
            WHERE user_id = $${paramIndex}
            RETURNING *
        `;
        values.push(user_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteTeacher(user_id) {
        const q = "DELETE FROM teachers WHERE user_id = $1";
        await pool.query(q, [user_id]);
        return true;
    }

    static async getTeachersByProgramme(programme) {
        const q = "SELECT * FROM teachers WHERE programme = $1";
        const { rows } = await pool.query(q, [programme]);
        return rows;
    }

    static async getTeachersByDept(dept) {
        const q = "SELECT * FROM teachers WHERE dept = $1";
        const { rows } = await pool.query(q, [dept]);
        return rows;
    }
}

// Usage example:
// import { TeacherModel } from '../models/teacher.model.js';
//
// const example = async () => {
//   try {
//     const teachers = await TeacherModel.getAllTeachers();
//     console.log(teachers);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
