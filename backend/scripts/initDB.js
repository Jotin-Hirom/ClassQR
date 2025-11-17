import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../src/config/db.js";

//import.meta.url is a special value available in ES modules that gives the URL of the current script file.
const __filename = fileURLToPath(import.meta.url);
console.log(" __filename:", __filename);
const __dirname = path.dirname(__filename);
//Takes only the directory path from the full file path.
console.log(" __dirname:", __dirname);

async function initDB() {
  try {
    console.log("STEP 1: Resolving schema path...");
    // Joins directory path with schema.sql to get the full path to the schema file.
    const schemaPath = path.join(__dirname, "schema.sql");
    console.log("Schema path:", schemaPath);

    console.log("STEP 2: Reading schema file...");
    const schema = fs.readFileSync(schemaPath, "utf8");
    console.log("Schema size:", schema.length, "bytes");

    console.log("STEP 3: Executing schema...");
    try {
      try {
        console.log("Coming connect");
        await pool.connect();
      } catch (error) {
        console.log(error);
      }
      console.log("Coming query");
      await pool.query(schema);
    } catch (sqlError) {
      console.error(" SQL Error:", sqlError);
      process.exit(1);
    }


    console.log("Database tables created successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Error initializing DB:", err);
    process.exit(1);
  }
}

initDB();
