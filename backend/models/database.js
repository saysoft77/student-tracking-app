const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../tracking.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Create Student table
    db.run(`
      CREATE TABLE IF NOT EXISTS Student (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        grade INTEGER NOT NULL,
        class TEXT NOT NULL
      )
    `);

    // Create Standards table
    db.run(`
      CREATE TABLE IF NOT EXISTS Standards (
        id INTEGER PRIMARY KEY,
        grade_band TEXT,
        standard_num INTEGER,
        benchmark_num INTEGER,
        criteria_num INTEGER, 
        level_num INTEGER,
        title TEXT,
        description TEXT
      )
    `);

    // Create Time Period table
    db.run(`
      CREATE TABLE IF NOT EXISTS TimePeriod (
        time_period_id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_name TEXT NOT NULL,
        quarter INTEGER NOT NULL,
        school_year TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
      )
    `);

    // Create Performance Record table
    db.run(`
      CREATE TABLE IF NOT EXISTS PerformanceRecord (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        standard_id INTEGER NOT NULL,
        time_period_id INTEGER NOT NULL,
        date_assessed DATE,
        comments TEXT,
        FOREIGN KEY (student_id) REFERENCES Student (student_id) ON DELETE CASCADE,
        FOREIGN KEY (standard_id) REFERENCES Standards (id) ON DELETE CASCADE,
        FOREIGN KEY (time_period_id) REFERENCES TimePeriod (time_period_id) ON DELETE CASCADE
      )
    `);
  });
}

module.exports = db;