import pool from "../config/pool.js";

export class RefreshTokenModel {
    static async getAllRefreshTokens() {
        const q = "SELECT * FROM refresh_tokens";
        const { rows } = await pool.query(q);
        return rows;
    }

    static async getRefreshTokenById(token_id) {
        const q = "SELECT * FROM refresh_tokens WHERE token_id = $1";
        const { rows } = await pool.query(q, [token_id]);
        return rows[0];
    }

    static async createRefreshToken({ user_id, token_hash, expires_at, revoked }) {
        const q = `
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(q, [user_id, token_hash, expires_at, revoked]);
        return rows[0];
    }

    static async updateRefreshToken(token_id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.token_hash !== undefined) {
            fields.push(`token_hash = $${paramIndex++}`);
            values.push(updates.token_hash);
        }
        if (updates.expires_at !== undefined) {
            fields.push(`expires_at = $${paramIndex++}`);
            values.push(updates.expires_at);
        }
        if (updates.revoked !== undefined) {
            fields.push(`revoked = $${paramIndex++}`);
            values.push(updates.revoked);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const q = `
            UPDATE refresh_tokens
            SET ${fields.join(', ')}
            WHERE token_id = $${paramIndex}
            RETURNING *
        `;
        values.push(token_id);
        const { rows } = await pool.query(q, values);
        return rows[0];
    }

    static async deleteRefreshToken(token_id) {
        const q = "DELETE FROM refresh_tokens WHERE token_id = $1";
        await pool.query(q, [token_id]);
        return true;
    }

    static async getRefreshTokensByUser(user_id) {
        const q = "SELECT * FROM refresh_tokens WHERE user_id = $1";
        const { rows } = await pool.query(q, [user_id]);
        return rows;
    }

    static async getValidRefreshTokensByUser(user_id) {
        const q = "SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked = FALSE AND expires_at > NOW()";
        const { rows } = await pool.query(q, [user_id]);
        return rows;
    }

    static async revokeRefreshToken(token_id) {
        const q = "UPDATE refresh_tokens SET revoked = TRUE WHERE token_id = $1 RETURNING *";
        const { rows } = await pool.query(q, [token_id]);
        return rows[0];
    }

    static async revokeAllRefreshTokensByUser(user_id) {
        const q = "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1";
        await pool.query(q, [user_id]);
        return true;
    }
}

// Usage example:
// import { RefreshTokenModel } from '../models/refreshToken.model.js';
//
// const example = async () => {
//   try {
//     const tokens = await RefreshTokenModel.getAllRefreshTokens();
//     console.log(tokens);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
