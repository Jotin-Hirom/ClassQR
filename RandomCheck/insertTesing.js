//DO NOT RUN THIS FILE DIRECTLY UNLESS YOU WANT TO SEED THE DATABASE WITH TEST DATA.
//This file is to be used for seeding the database with test data for development and testing purposes only.
//Iniatialize "db:seed": "node {folderName}/seed.js" in package.json scripts 
// and run "npm run db:seed" command to execute this file.

import pool from "../src/config/db.js";

console.log(" Starting seed script...");

async function seed() {
  try {
    try {
        console.log("Connecting to the database...");
        await pool.connect();
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
    console.log("🔹 Clearing all old rows from each table if exists...");
    await pool.query(`
      DELETE FROM reports;
      DELETE FROM verification_logs;
      DELETE FROM attendance;
      DELETE FROM scan_events;
      DELETE FROM qr_sessions;
      DELETE FROM student_enrollments;
      DELETE FROM course_offerings;
      DELETE FROM subjects;
      DELETE FROM teachers;
      DELETE FROM students;
      DELETE FROM users;
    `);

    console.log("🔹 Inserting USERS...");

    await pool.query(`
      -- 5 Students
      INSERT INTO users (user_id, email, password_hash, role) VALUES
      (gen_random_uuid(), 'st101@tezu.ac.in', 'hash123', 'student'),
      (gen_random_uuid(), 'st102@tezu.ac.in', 'hash123', 'student'),
      (gen_random_uuid(), 'st103@tezu.ac.in', 'hash123', 'student'),
      (gen_random_uuid(), 'st104@tezu.ac.in', 'hash123', 'student'),
      (gen_random_uuid(), 'st105@tezu.ac.in', 'hash123', 'student');

      -- 5 Teachers
      INSERT INTO users (user_id, email, password_hash, role) VALUES
      (gen_random_uuid(), 't001@tezu.ac.in', 'hash456', 'teacher'),
      (gen_random_uuid(), 't002@tezu.ac.in', 'hash456', 'teacher'),
      (gen_random_uuid(), 't003@tezu.ac.in', 'hash456', 'teacher'),
      (gen_random_uuid(), 't004@tezu.ac.in', 'hash456', 'teacher'),
      (gen_random_uuid(), 't005@tezu.ac.in', 'hash456', 'teacher');

      -- 1 Admin
      INSERT INTO users (user_id, email, password_hash, role)
      VALUES (gen_random_uuid(), 'admin@tezu.ac.in', 'adminhash', 'admin');
    `);

    // Fetch all users
    const { rows: users } = await pool.query(`
      SELECT user_id, email, role FROM users ORDER BY created_at;
    `);

    const studentUsers = users.filter(u => u.role === "student");
    const teacherUsers = users.filter(u => u.role === "teacher");

    console.log("🔹 Inserting STUDENTS...");
    await pool.query(`
      INSERT INTO students (user_id, roll_no, sname, semester, programme, batch)
      VALUES
      ('${studentUsers[0].user_id}', 'CSE23001', 'Anand Rai', 5, 'BTech CSE', 2023),
      ('${studentUsers[1].user_id}', 'CSE23002', 'Manoj Das', 6, 'BTech CSE', 2023),
      ('${studentUsers[2].user_id}', 'ECE23003', 'Rahul Singh', 4, 'BTech ECE', 2023),
      ('${studentUsers[3].user_id}', 'ECE23004', 'Priya Sen', 7, 'BTech ECE', 2022),
      ('${studentUsers[4].user_id}', 'IT23005', 'Rina Devi', 8, 'BTech IT', 2022);
    `);

    console.log("🔹 Inserting TEACHERS...");
    await pool.query(`
      INSERT INTO teachers (user_id, abbr, tname, designation, specialization, dept, programme)
      VALUES
      ('${teacherUsers[0].user_id}', 'AKS', 'Dr. A. K. Sharma', 'Professor', 'AI & ML', 'CSE', 'BTech CSE'),
      ('${teacherUsers[1].user_id}', 'RMN', 'Dr. R. Mondal', 'Associate Prof', 'Embedded Systems', 'ECE', 'BTech ECE'),
      ('${teacherUsers[2].user_id}', 'PKD', 'Dr. P. Kalita', 'Assistant Prof', 'Networking', 'CSE', 'BTech CSE'),
      ('${teacherUsers[3].user_id}', 'SNG', 'Dr. S. Naga', 'Associate Prof', 'DBMS', 'IT', 'BTech IT'),
      ('${teacherUsers[4].user_id}', 'BDN', 'Dr. B. Dutta', 'Professor', 'IoT', 'ECE', 'BTech ECE');
    `);

    console.log("🔹 Inserting SUBJECTS...");
    await pool.query(`
      INSERT INTO subjects (sub_code, sub_name, sub_credit) VALUES
      ('CS101', 'Introduction to Programming', 4),
      ('CS202', 'Data Structures', 4),
      ('EC150', 'Basic Electronics', 3),
      ('IT210', 'Database Systems', 4),
      ('CS350', 'Machine Learning', 3);
    `);

    console.log("🔹 Inserting COURSE OFFERINGS...");
    const { rows: teacherData } = await pool.query(`SELECT user_id FROM teachers ORDER BY user_id`);
    const teacherIDs = teacherData.map(t => t.user_id);

    await pool.query(`
      INSERT INTO course_offerings (course_id, teacher_id, sub_code, semester, programme)
      VALUES
      (gen_random_uuid(), '${teacherIDs[0]}', 'CS101', 1, 'BTech CSE'),
      (gen_random_uuid(), '${teacherIDs[2]}', 'CS202', 3, 'BTech CSE'),
      (gen_random_uuid(), '${teacherIDs[3]}', 'IT210', 5, 'BTech IT'),
      (gen_random_uuid(), '${teacherIDs[4]}', 'EC150', 2, 'BTech ECE'),
      (gen_random_uuid(), '${teacherIDs[0]}', 'CS350', 6, 'BTech CSE');
    `);

    const { rows: courses } = await pool.query(`SELECT course_id FROM course_offerings`);

    console.log("🔹 Enrolling students...");
    await pool.query(`
      INSERT INTO student_enrollments (enrollment_id, student_id, course_id)
      VALUES
      (gen_random_uuid(), '${studentUsers[0].user_id}', '${courses[0].course_id}'),
      (gen_random_uuid(), '${studentUsers[1].user_id}', '${courses[1].course_id}'),
      (gen_random_uuid(), '${studentUsers[2].user_id}', '${courses[2].course_id}'),
      (gen_random_uuid(), '${studentUsers[3].user_id}', '${courses[3].course_id}'),
      (gen_random_uuid(), '${studentUsers[4].user_id}', '${courses[4].course_id}');
    `);

    console.log("🔹 Creating QR sessions...");
    await pool.query(`
      INSERT INTO qr_sessions (qr_id, course_id, location_created_from, timespan_seconds, expires_at)
      VALUES
      (gen_random_uuid(), '${courses[0].course_id}', 'Building A', 600, NOW() + INTERVAL '10 min'),
      (gen_random_uuid(), '${courses[1].course_id}', 'Building B', 600, NOW() + INTERVAL '10 min'),
      (gen_random_uuid(), '${courses[2].course_id}', 'Building C', 600, NOW() + INTERVAL '10 min'),
      (gen_random_uuid(), '${courses[3].course_id}', 'Building D', 600, NOW() + INTERVAL '10 min'),
      (gen_random_uuid(), '${courses[4].course_id}', 'Building E', 600, NOW() + INTERVAL '10 min');
    `);

    const { rows: qrRows } = await pool.query(`SELECT qr_id FROM qr_sessions`);

    console.log("🔹 Creating SCAN events...");
    await pool.query(`
      INSERT INTO scan_events (scan_id, qr_id, student_id, device_fingerprint, ip_address, geo, token_age_seconds, ml_score, status)
      VALUES
      (gen_random_uuid(), '${qrRows[0].qr_id}', '${studentUsers[0].user_id}', 'dev123', '10.0.0.1', 'Campus', 5, 0.1, 'accepted'),
      (gen_random_uuid(), '${qrRows[1].qr_id}', '${studentUsers[1].user_id}', 'dev234', '10.0.0.2', 'Campus', 7, 0.2, 'accepted'),
      (gen_random_uuid(), '${qrRows[2].qr_id}', '${studentUsers[2].user_id}', 'dev345', '10.0.0.3', 'Campus', 9, 0.3, 'new'),
      (gen_random_uuid(), '${qrRows[3].qr_id}', '${studentUsers[3].user_id}', 'dev456', '10.0.0.4', 'Campus', 12, 0.4, 'pending'),
      (gen_random_uuid(), '${qrRows[4].qr_id}', '${studentUsers[4].user_id}', 'dev567', '10.0.0.5', 'Campus', 15, 0.8, 'suspicious');
    `);

    const { rows: scans } = await pool.query(`SELECT scan_id FROM scan_events`);

    console.log("🔹 Creating ATTENDANCE records...");
    await pool.query(`
      INSERT INTO attendance (attendance_id, scan_id, student_id, course_id, status, scanned_time, date)
      VALUES
      (gen_random_uuid(), '${scans[0].scan_id}', '${studentUsers[0].user_id}', '${courses[0].course_id}', 'present', NOW(), CURRENT_DATE),
      (gen_random_uuid(), '${scans[1].scan_id}', '${studentUsers[1].user_id}', '${courses[1].course_id}', 'present', NOW(), CURRENT_DATE),
      (gen_random_uuid(), '${scans[2].scan_id}', '${studentUsers[2].user_id}', '${courses[2].course_id}', 'absent', NULL, CURRENT_DATE),
      (gen_random_uuid(), '${scans[3].scan_id}', '${studentUsers[3].user_id}', '${courses[3].course_id}', 'present', NOW(), CURRENT_DATE),
      (gen_random_uuid(), '${scans[4].scan_id}', '${studentUsers[4].user_id}', '${courses[4].course_id}', 'present', NOW(), CURRENT_DATE);
    `);

    console.log("🔹 Creating VERIFICATION logs...");
    await pool.query(`
      INSERT INTO verification_logs (verify_id, scan_id, teacher_id, result, comment)
      VALUES
      (gen_random_uuid(), '${scans[0].scan_id}', '${teacherIDs[0]}', 'accepted', 'OK'),
      (gen_random_uuid(), '${scans[1].scan_id}', '${teacherIDs[2]}', 'accepted', 'Good'),
      (gen_random_uuid(), '${scans[2].scan_id}', '${teacherIDs[3]}', 'rejected', 'Late'),
      (gen_random_uuid(), '${scans[3].scan_id}', '${teacherIDs[4]}', 'accepted', 'Valid'),
      (gen_random_uuid(), '${scans[4].scan_id}', '${teacherIDs[1]}', 'rejected', 'Suspicious');
    `);

    console.log("🔹 Generating REPORTS...");
    await pool.query(`
      INSERT INTO reports (report_id, teacher_id, course_id, report_type, file_url)
      VALUES
      (gen_random_uuid(), '${teacherIDs[0]}', '${courses[0].course_id}', 'attendance_summary', 'report1.pdf'),
      (gen_random_uuid(), '${teacherIDs[2]}', '${courses[1].course_id}', 'attendance_monthly', 'report2.pdf'),
      (gen_random_uuid(), '${teacherIDs[3]}', '${courses[2].course_id}', 'daily_report', 'report3.pdf'),
      (gen_random_uuid(), '${teacherIDs[4]}', '${courses[3].course_id}', 'weekly_report', 'report4.pdf'),
      (gen_random_uuid(), '${teacherIDs[1]}', '${courses[4].course_id}', 'attendance_overall', 'report5.pdf');
    `);

    console.log(" Seed completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error(" Seed error:", err);
    process.exit(1);
  }
}

seed();
