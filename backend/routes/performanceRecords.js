const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Save or update a performance record
router.post('/', (req, res) => {
  const { student_id, standard_num, benchmark_num, criteria_num, level_num, comment } = req.body;

  db.run(
    `
    INSERT INTO PerformanceRecord (student_id, standard_num, benchmark_num, criteria_num, level_num, comment)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id, standard_num, benchmark_num, criteria_num)
    DO UPDATE SET level_num = excluded.level_num, comment = excluded.comment
    `,
    [student_id, standard_num, benchmark_num, criteria_num, level_num, comment],
    (err) => {
      if (err) {
        console.error('Error saving performance record:', err.message);
        res.status(500).json({ error: 'Failed to save performance record' });
      } else {
        res.json({ message: 'Performance record saved successfully' });
      }
    }
  );
});

module.exports = router;