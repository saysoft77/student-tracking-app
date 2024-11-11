const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../backend/tracking.db');

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

    // Create Standard table
    db.run(`
      CREATE TABLE IF NOT EXISTS Standard (
        standard_id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        category TEXT NOT NULL
      )
    `);

    // Create Benchmark table
    db.run(`
      CREATE TABLE IF NOT EXISTS Benchmark (
        benchmark_id INTEGER PRIMARY KEY AUTOINCREMENT,
        standard_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        FOREIGN KEY (standard_id) REFERENCES Standard (standard_id) ON DELETE CASCADE
      )
    `);

    // Create Criteria table
    db.run(`
      CREATE TABLE IF NOT EXISTS Criteria (
        criteria_id INTEGER PRIMARY KEY AUTOINCREMENT,
        benchmark_id INTEGER NOT NULL,
        level TEXT NOT NULL,
        description TEXT NOT NULL,
        FOREIGN KEY (benchmark_id) REFERENCES Benchmark (benchmark_id) ON DELETE CASCADE
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
        benchmark_id INTEGER NOT NULL,
        criteria_id INTEGER NOT NULL,
        time_period_id INTEGER NOT NULL,
        date_assessed DATE,
        comments TEXT,
        FOREIGN KEY (student_id) REFERENCES Student (student_id) ON DELETE CASCADE,
        FOREIGN KEY (benchmark_id) REFERENCES Benchmark (benchmark_id) ON DELETE CASCADE,
        FOREIGN KEY (criteria_id) REFERENCES Criteria (criteria_id) ON DELETE CASCADE,
        FOREIGN KEY (time_period_id) REFERENCES TimePeriod (time_period_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
      } else {
        console.log('All tables created successfully.');
      }
    });
  });
}

module.exports = db;