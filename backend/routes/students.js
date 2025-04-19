const express = require('express');
const router = express.Router();
const db = require('../models/database'); // Adjust the path to your database connection file

// Get all students
router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM Students ORDER BY last_name, first_name',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ students: rows });
    }
  );
});

// Endpoint to fetch a specific student's details by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `
    SELECT 
      Students.student_id, 
      Students.first_name, 
      Students.last_name, 
      Classes.grade, 
      Classes.teacher_name AS class
    FROM Students
    INNER JOIN Classes ON Students.class_id = Classes.class_id
    WHERE Students.student_id = ?
    `,
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching student:', err.message);
        res.status(500).json({ error: 'Failed to fetch student' });
      } else if (!row) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        res.json(row);
      }
    }
  );
});

module.exports = router;
