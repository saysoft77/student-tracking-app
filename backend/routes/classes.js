const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.resolve(__dirname, '../tracking.db');
const db = new sqlite3.Database(dbPath);

// API endpoint to fetch combined student and class data
router.get('/', async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      db.all(
        `
        SELECT 
          Students.student_id, 
          Students.first_name, 
          Students.last_name, 
          Classes.grade, 
          Classes.teacher_name AS class
        FROM Students
        INNER JOIN Classes ON Students.class_id = Classes.class_id
        `,
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        }
      );
    });

    res.json({ data });
  } catch (error) {
    console.error('Error fetching class data:', error.message);
    res.status(500).json({ error: 'Failed to fetch class data' });
  }
});

module.exports = router;