import pool from "../config/pool.js";
export class VerificationModel {

    static async getAllVerifications() {
        const q = "SELECT * FROM verification_logs";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getVerificationById(verify_id) {
        const q = "SELECT * FROM verification_logs WHERE verify_id = $1";
        const { rows } = await pool.query(q, [verify_id]);
        return rows[0];
    }

    static async getVerificationsByScan(scan_id) {
        const q = "SELECT * FROM verification_logs WHERE scan_id = $1";
        const { rows } = await pool.query(q, [scan_id]);
        return rows;
    }

    static async getVerificationsByTeacher(teacher_id) {
        const q = "SELECT * FROM verification_logs WHERE teacher_id = $1";
        const { rows } = await pool.query(q, [teacher_id]);
        return rows;
    }

    static async createVerification({ scan_id, teacher_id, result, comment }) {
        const q = `
            INSERT INTO verification_logs (scan_id, teacher_id, result, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [scan_id, teacher_id, result, comment]);
        return rows[0];
    }

    static async updateVerification(verify_id, { result, comment }) {
        const q = `
            UPDATE verification_logs
            SET result = $1, comment = $2
            WHERE verify_id = $3
            RETURNING *
        `;
        const { rows } = await pool.query(q, [result, comment, verify_id]);
        return rows[0];
    }

    static async deleteVerification(verify_id) {
        const q = "DELETE FROM verification_logs WHERE verify_id = $1";
        await pool.query(q, [verify_id]);
        return true;
    }
}
