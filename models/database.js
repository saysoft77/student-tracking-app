const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../backend/students.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS students (
      StudentID INTEGER PRIMARY KEY,
      FirstName TEXT,
      LastName TEXT,
      Grade INTEGER,
      Class TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err);
      } else {
        console.log('Students table created or already exists.');
      }
    });
  }
});

module.exports = db;