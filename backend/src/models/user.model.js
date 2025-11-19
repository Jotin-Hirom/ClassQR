import pool from "../config/pool";

export const UserModel = {
  // Example method to find a user by email
  async findByEmail(email) { 
    const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0];
  }
};