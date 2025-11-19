import pool from "../config/pool.js";

export class ReportModel {
    static async getAllReports() {
        const q = "SELECT * FROM reports";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getReportById(report_id) {
        const q = "SELECT * FROM reports WHERE report_id = $1";
        const { rows } = await pool.query(q, [report_id]);
        return rows[0];
    }

    static async createReport({ teacher_id, course_id, report_type, generated_at, file_url }) {
        const q = `
            INSERT INTO reports (teacher_id, course_id, report_type, generated_at, file_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [teacher_id, course_id, report_type, generated_at, file_url]);
        return rows[0];
    }

    static async updateReport(report_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.report_type !== undefined) {
            fields.push(`report_type = $${paramIndex++}`);
            values.push(updates.report_type);
        }
        if (updates.generated_at !== undefined) {
            fields.push(`generated_at = $${paramIndex++}`);
            values.push(updates.generated_at);
        }
        if (updates.file_url !== undefined) {
            fields.push(`file_url = $${paramIndex++}`);
            values.push(updates.file_url);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE reports
            SET ${fields.join(', ')}
            WHERE report_id = $${paramIndex}
            RETURNING *
        `;
        values.push(report_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteReport(report_id) {
        const q = "DELETE FROM reports WHERE report_id = $1";
        await pool.query(q, [report_id]);
        return true;
    }

    static async getReportsByTeacher(teacher_id) {
        const q = "SELECT * FROM reports WHERE teacher_id = $1";
        const { rows } = await pool.query(q, [teacher_id]);
        return rows;
    }

    static async getReportsByCourse(course_id) {
        const q = "SELECT * FROM reports WHERE course_id = $1";
        const { rows } = await pool.query(q, [course_id]);
        return rows;
    }

    static async getReportsByType(report_type) {
        const q = "SELECT * FROM reports WHERE report_type = $1";
        const { rows } = await pool.query(q, [report_type]);
        return rows;
    }
}

// Usage example:
// import { ReportModel } from '../models/report.model.js';
//
// const example = async () => {
//   try {
//     const reports = await ReportModel.getAllReports();
//     console.log(reports);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
