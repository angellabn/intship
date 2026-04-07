const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "assignment"
});

db.connect((err) => {
  if (err) {
    console.log(err);
  }
  console.log("Database connected");
});

module.exports = db;