import pool from "../config/pool.js";

export class QrSessionModel {
    static async getAllQrSessions() {
        const q = "SELECT * FROM qr_sessions";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getQrSessionById(qr_id) {
        const q = "SELECT * FROM qr_sessions WHERE qr_id = $1";
        const { rows } = await pool.query(q, [qr_id]);
        return rows[0];
    }

    static async getQrSessionsByCourse(course_id) {
        const q = "SELECT * FROM qr_sessions WHERE course_id = $1";
        const { rows } = await pool.query(q, [course_id]);
        return rows;
    }

    static async createQrSession({ course_id, location_created_from, timespan_seconds }) {
        const q = `
            INSERT INTO qr_sessions (course_id, location_created_from, timespan_seconds, expires_at)
            VALUES ($1, $2, $3, NOW() + INTERVAL '${timespan_seconds} seconds')
            RETURNING *
        `;
        const { rows } = await pool.query(q, [course_id, location_created_from, timespan_seconds]);
        return rows[0];
    }

    static async updateQrSession(qr_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.location_created_from !== undefined) {
            fields.push(`location_created_from = $${paramIndex++}`);
            values.push(updates.location_created_from);
        }
        if (updates.timespan_seconds !== undefined) {
            fields.push(`timespan_seconds = $${paramIndex++}`);
            values.push(updates.timespan_seconds);
            fields.push(`expires_at = NOW() + INTERVAL '${updates.timespan_seconds} seconds'`);
        }
        if (updates.scan_count !== undefined) {
            fields.push(`scan_count = $${paramIndex++}`);
            values.push(updates.scan_count);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE qr_sessions
            SET ${fields.join(', ')}
            WHERE qr_id = $${paramIndex}
            RETURNING *
        `;
        values.push(qr_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteQrSession(qr_id) {
        const q = "DELETE FROM qr_sessions WHERE qr_id = $1";
        await pool.query(q, [qr_id]);
        return true;
    }

    static async incrementScanCount(qr_id) {
        const q = `
            UPDATE qr_sessions
            SET scan_count = scan_count + 1
            WHERE qr_id = $1
            RETURNING *
        `;
        const { rows } = await pool.query(q, [qr_id]);
        return rows[0];
    }

    static async getActiveQrSessions() {
        const q = "SELECT * FROM qr_sessions WHERE expires_at > NOW()";
        const { rows } = await pool.query(q);
        return rows;
    }
}

// Usage example:
// import { QrSessionModel } from '../models/qrSession.model.js';
//
// const example = async () => {
//   try {
//     const qrSessions = await QrSessionModel.getAllQrSessions();
//     console.log(qrSessions);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
