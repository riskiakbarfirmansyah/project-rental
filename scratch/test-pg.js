const { Pool } = require("pg");
require("dotenv").config();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connection successful:", res.rows[0]);
  } catch (err) {
    console.error("Connection failed:", err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
