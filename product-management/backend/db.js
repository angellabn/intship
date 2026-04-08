const mysql = require("mysql2");

let db;

try {
  db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "assignment",
    port: process.env.DB_PORT || 3306
  });

  db.connect((err) => {
    if (err) {
      console.log("⚠ Database not connected (Render has no local MySQL)");
    } else {
      console.log("✅ Database connected");
    }
  });

} catch (err) {
  console.log("⚠ DB skipped");
}

module.exports = db;