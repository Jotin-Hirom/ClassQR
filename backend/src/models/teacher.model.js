import pool from "../config/pool.js";
import { findByEmail as userFindByEmail } from "../services/user.service.js";

export const TeacherModel = {
  // Example method to find a teacher by email
  findByEmail: async (email) => {
    if (!email) {
      throw new Error("email is required");
    }
    const user = await userFindByEmail(email);
    return user;
  },
};