import pool from "../config/pool.js";

export class SubjectModel {
    static async getAllSubjects() {
        const q = "SELECT * FROM subjects";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getSubjectByCode(sub_code) {
        const q = "SELECT * FROM subjects WHERE sub_code = $1";
        const { rows } = await pool.query(q, [sub_code]);
        return rows[0];
    }

    static async createSubject({ sub_code, sub_name }) {
        const q = `
            INSERT INTO subjects (sub_code, sub_name)
            VALUES ($1, $2)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [sub_code, sub_name]);
        return rows[0];
    }

    static async updateSubject(sub_code, { sub_name }) {
        const q = `
            UPDATE subjects
            SET sub_name = $1
            WHERE sub_code = $2
            RETURNING *
        `;
        const { rows } = await pool.query(q, [sub_name, sub_code]);
        return rows[0];
    }

    static async deleteSubject(sub_code) {
        const q = "DELETE FROM subjects WHERE sub_code = $1";
        await pool.query(q, [sub_code]);
        return true;
    }
}

// Usage example:
// import { SubjectModel } from '../models/subject.model.js';
//
// const example = async () => {
//   try {
//     const subjects = await SubjectModel.getAllSubjects();
//     console.log(subjects);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
