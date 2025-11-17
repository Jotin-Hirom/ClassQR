export const createUser = async () => {};
export const validateUser = async () => {};
export const generateTokens = async () => {};
export const refreshTokens = async () => {};

import bcrypt from "bcryptjs";
import pool from "../config/db.js";
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

/**
 * Create a student user + student profile in a transaction
 * Expects fields: email, password, name (sname), roll_no, semester, programme, batch, photo_url (optional)
 */
export const createStudentUser = async (payload) => {
  const {
    email,
    password,
    sname,
    roll_no,
    semester,
    programme,
    batch,
    photo_url = null,
  } = payload;

  // Basic validation
  if (!sname || !isValidName(sname)) throwError(400, "Invalid student name");
  if (!roll_no || !isValidRoll(roll_no)) throwError(400, "Invalid roll_no format (3 letters + 5 digits)");
  if (!email || !isValidEmailForRoll(email, roll_no)) throwError(400, "Email must be roll_no@tezu.ac.in");
  if (!isValidSemester(semester)) throwError(400, "Semester must be an integer between 4 and 10");
  if (!programme || !isValidProgramme(programme)) throwError(400, "Invalid programme (alphabets only)");
  if (!isValidBatch(batch)) throwError(400, "Invalid batch year");
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
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'student')
      RETURNING user_id, email, role, created_at
    `;
    const userRes = await client.query(insertUserText, [email.toLowerCase(), password_hash]);
    const user = userRes.rows[0];

    // Insert into students
    const insertStudentText = `
      INSERT INTO students (user_id, roll_no, sname, semester, programme, batch, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, roll_no, sname, semester, programme, batch, photo_url
    `;
    const studentRes = await client.query(insertStudentText, [
      user.user_id,
      roll_no.toUpperCase(),
      sname,
      semester,
      programme,
      batch,
      photo_url,
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
  const {
    email,
    password,
    tname,
    abbr,
    designation,
    specialization = null,
    dept,
    programme = null,
    photo_url = null,
  } = payload;

  // Validation
  if (!tname || !isValidName(tname)) throwError(400, "Invalid teacher name.");
  if (!abbr || typeof abbr !== "string" || abbr.trim().length < 2) throwError(400, "Invalid abbreviation.");
  if (!email || !email.toLowerCase().endsWith("@tezu.ac.in")) throwError(400, "Email must end with @tezu.ac.in.");
  if (!designation || !isValidDesignationOrDept(designation)) throwError(400, "Invalid designation.");
  if (!dept || !isValidDesignationOrDept(dept)) throwError(400, "Invalid department.");
  if (!password || !isValidPassword(password)) throwError(400, "Password does not meet complexity requirements.");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertUserText = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'teacher')
      RETURNING user_id, email, role, created_at
    `;
    const userRes = await client.query(insertUserText, [email.toLowerCase(), password_hash]);
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
