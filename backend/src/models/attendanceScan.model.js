import pool from "../config/pool.js";

export class AttendanceScanModel {
    static async getAllScanEvents() {
        const q = "SELECT * FROM scan_events";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getScanEventById(scan_id) {
        const q = "SELECT * FROM scan_events WHERE scan_id = $1";
        const { rows } = await pool.query(q, [scan_id]);
        return rows[0];
    }

    static async createScanEvent({ qr_id, student_id, scan_time, device_fingerprint, device_meta, ip_address, geo, token_age_seconds, ml_score, status }) {
        const q = `
            INSERT INTO scan_events (qr_id, student_id, scan_time, device_fingerprint, device_meta, ip_address, geo, token_age_seconds, ml_score, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [qr_id, student_id, scan_time, device_fingerprint, device_meta, ip_address, geo, token_age_seconds, ml_score, status]);
        return rows[0];
    }

    static async updateScanEvent(scan_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.scan_time !== undefined) {
            fields.push(`scan_time = $${paramIndex++}`);
            values.push(updates.scan_time);
        }
        if (updates.device_fingerprint !== undefined) {
            fields.push(`device_fingerprint = $${paramIndex++}`);
            values.push(updates.device_fingerprint);
        }
        if (updates.device_meta !== undefined) {
            fields.push(`device_meta = $${paramIndex++}`);
            values.push(updates.device_meta);
        }
        if (updates.ip_address !== undefined) {
            fields.push(`ip_address = $${paramIndex++}`);
            values.push(updates.ip_address);
        }
        if (updates.geo !== undefined) {
            fields.push(`geo = $${paramIndex++}`);
            values.push(updates.geo);
        }
        if (updates.token_age_seconds !== undefined) {
            fields.push(`token_age_seconds = $${paramIndex++}`);
            values.push(updates.token_age_seconds);
        }
        if (updates.ml_score !== undefined) {
            fields.push(`ml_score = $${paramIndex++}`);
            values.push(updates.ml_score);
        }
        if (updates.status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(updates.status);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE scan_events
            SET ${fields.join(', ')}
            WHERE scan_id = $${paramIndex}
            RETURNING *
        `;
        values.push(scan_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteScanEvent(scan_id) {
        const q = "DELETE FROM scan_events WHERE scan_id = $1";
        await pool.query(q, [scan_id]);
        return true;
    }

    static async getScanEventsByStudent(student_id) {
        const q = "SELECT * FROM scan_events WHERE student_id = $1";
        const { rows } = await pool.query(q, [student_id]);
        return rows;
    }

    static async getScanEventsByQr(qr_id) {
        const q = "SELECT * FROM scan_events WHERE qr_id = $1";
        const { rows } = await pool.query(q, [qr_id]);
        return rows;
    }

    static async getScanEventsByStatus(status) {
        const q = "SELECT * FROM scan_events WHERE status = $1";
        const { rows } = await pool.query(q, [status]);
        return rows;
    }
}

// Usage example:
// import { AttendanceScanModel } from '../models/attendanceScan.model.js';
//
// const example = async () => {
//   try {
//     const scanEvents = await AttendanceScanModel.getAllScanEvents();
//     console.log(scanEvents);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
