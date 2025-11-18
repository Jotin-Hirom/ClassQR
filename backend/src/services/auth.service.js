import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import {
  isValidName,
  isValidRoll,
  isValidEmailForRoll,
  isValidSemester,
  isValidProgramme,
  isValidBatch,
  isValidPassword,
  isValidDesignationOrDept,
} from "../utils/validator.js";

/**
 * Helper to throw formatted error
 */
const throwError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};



// Generate user_id
const user_id = uuidv4();
// Generate token_id
const token_id = uuidv4();




/**
 * Create a student user + student profile in a transaction
 * Expects fields: email, password, name (sname), roll_no, semester, programme, batch, photo_url (optional)
 */
export const createStudentUser = async (payload) => {
  const emailLower = payload.email.toLowerCase();
  console.log(emailLower); 
  // Extract roll from email
  const roll = emailLower.split("@")[0];
  console.log(roll); 
  const {
    email,
    password,
    sname= null,
    roll_no= null,
    semester= null,
    programme= null,
    batch= null,
    photo_url = null,
  } = payload;

  // Basic validation
  // if (!sname || !isValidName(sname)) throwError(400, "Invalid student name");
  if (!roll || !isValidRoll(roll)) throwError(400, "Invalid roll_no format (3 letters + 5 digits)");
  if (!email || !isValidEmailForRoll(email, roll)) throwError(400, "Email must be roll_no@tezu.ac.in");
  // if (!isValidSemester(semester)) throwError(400, "Semester must be an integer between 4 and 10");
  // if (!programme || !isValidProgramme(programme)) throwError(400, "Invalid programme (alphabets only)");
  // if (!isValidBatch(batch)) throwError(400, "Invalid batch year");
  if (!password || !isValidPassword(password)) throwError(400, "Password does not meet complexity requirements");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Insert into DB in a transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");


    // Insert into users
    const insertUserText = `
      INSERT INTO users (user_id, email, password_hash, role)
      VALUES ($1, $2, $3, 'student')
      RETURNING user_id, email, role, created_at
    `;
    const userRes = await client.query(insertUserText, [user_id, email.toLowerCase(), password_hash]);
    const user = userRes.rows[0];

    // Insert into students
    const insertStudentText = `
      INSERT INTO students (user_id, roll_no)
      VALUES ($1, $2)
      RETURNING  user_id, roll_no, sname, semester, programme, batch, photo_url
    `;
    const studentRes = await client.query(insertStudentText, [
      user_id,
      roll.toUpperCase()
    ]);
    const student = studentRes.rows[0];

    await client.query("COMMIT");

    // return a minimal user object (no password)
    return {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      student_profile: student,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    // Check for unique violations
    if (err.code === "23505") {
      // unique violation
      if (err.detail && err.detail.includes("email")) {
        throwError(409, "Email already exists");
      }
      if (err.detail && err.detail.includes("roll_no")) {
        throwError(409, "Roll number already exists");
      }
      if (err.detail && err.detail.includes("abbr")) {
        throwError(409, "Teacher abbreviation already exists");
      }
      // generic unique
      throwError(409, "Duplicate value");
    }
    throw err;
  } finally {
    client.release();
  }
};





/**
 * Create teacher user + teacher profile
 * Expects fields: email, password, tname, abbr, designation, specialization (opt), dept, programme (opt), photo_url (opt)
 */
export const createTeacherUser = async (payload) => {
  console.log(payload);
  const emailLower = payload.email.toLowerCase();
  const Abbr = emailLower.split("@")[0];
  console.log(Abbr); 
  const {
    email,
    password,
    // tname,
    // abbr,
    designation=null,
    specialization = null,
    dept=null,
    programme = null,
    photo_url = null,
  } = payload;
   const tname = Abbr;
   const abbr = Abbr;
  // Validation
  if (!tname || !isValidName(tname)) throwError(400, "Invalid teacher name.");
  if (!abbr || typeof abbr !== "string" || abbr.trim().length < 2) throwError(400, "Invalid abbreviation.");
  if (!email || !email.toLowerCase().endsWith("@tezu.ac.in")) throwError(400, "Email must end with @tezu.ac.in.");
  // if (!designation || !isValidDesignationOrDept(designation)) throwError(400, "Invalid designation.");
  // if (!dept || !isValidDesignationOrDept(dept)) throwError(400, "Invalid department.");
  if (!password || !isValidPassword(password)) throwError(400, "Password does not meet complexity requirements.");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");


    const insertUserText = `
      INSERT INTO users (user_id, email, password_hash, role)
      VALUES ($1, $2, $3, 'teacher')
      RETURNING user_id, email, role, created_at
    `;
    console.log("User Before inserted");
    const userRes = await client.query(insertUserText, [user_id, email.toLowerCase(), password_hash]);
    console.log("User inserted");
    const user = userRes.rows[0];

    const insertTeacherText = `
      INSERT INTO teachers (user_id, abbr, tname, designation, specialization, dept, programme, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, abbr, tname, designation, specialization, dept, programme, photo_url
    `;
    const teacherRes = await client.query(insertTeacherText, [
      user.user_id,
      abbr.toUpperCase(),
      tname,
      designation,
      specialization,
      dept,
      programme,
      photo_url,
    ]);
    const teacher = teacherRes.rows[0];

    await client.query("COMMIT");

    return {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      teacher_profile: teacher,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      if (err.detail && err.detail.includes("email")) {
        throwError(409, "Email already exists");
      }
      if (err.detail && err.detail.includes("abbr")) {
        throwError(409, "Abbreviation already exists");
      }
      throwError(409, "Duplicate value");
    }
    throw err;
  } finally {
    client.release();
  }
};




/**
 * Get user by email (returns user row with password_hash)
 */
export const getUserByEmail = async (email) => {
  const q = "SELECT user_id, email, password_hash, role FROM users WHERE email = $1 LIMIT 1";
  const { rows } = await pool.query(q, [email]);
  return rows[0];
};




/**
 * Save refresh token
 * tokenObj: { user_id, token, expires_at (Date) }
 */
export const saveRefreshToken = async (tokenObj) => {
  // Hash the token before saving
  const salt = await bcrypt.genSalt(10);
  const token_hash = await bcrypt.hash(tokenObj.token_hash, salt);
  console.log(token_hash);
  // Save to DB
  const q = `INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at) VALUES ($1, $2, $3,$4)`;
  await pool.query(q, [token_id, tokenObj.user_id, token_hash, tokenObj.expires_at]);
};




/**
 * Revoke ALL refresh tokens for a specific user (optional support)
 */
export const revokeAllUserRefreshTokens = async (user_id) => {
  await pool.query(`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`, [user_id]);
};





/**
 * Find refresh token row by token string
 */
export const findRefreshToken = async (token) => {
  
  const q = `
    SELECT token_id, user_id, token_hash, expires_at, revoked
    FROM refresh_tokens
    WHERE user_id = $1 AND revoked = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [token]);
  return rows[0];
};





/**
 * Revoke refresh token by token string (used during rotation)
 */
export const revokeRefreshTokenByToken = async (token) => {
  const q = `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`;
  await pool.query(q, [token]);
};
