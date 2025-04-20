const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Add or update a performance record
router.post('/', (req, res) => {
  const {
    student_id,
    standard_num,
    benchmark_num,
    criteria_num,
    level_num,
    time_period_id,
    comment,
  } = req.body;

  // Validate required fields
  if (
    !student_id ||
    !standard_num ||
    !benchmark_num ||
    !criteria_num ||
    !level_num ||
    !time_period_id
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if a record already exists
  const selectQuery = `
    SELECT record_id FROM PerformanceRecord
    WHERE student_id = ? AND standard_num = ? AND benchmark_num = ? AND criteria_num = ? AND time_period_id = ?
  `;

  db.get(
    selectQuery,
    [student_id, standard_num, benchmark_num, criteria_num, time_period_id],
    (err, row) => {
      if (err) {
        console.error('Error checking for existing performance record:', err.message);
        return res.status(500).json({ error: 'Failed to check for existing performance record' });
      }

      console.log('Existing record:', row); // Log the result of the SELECT query

      if (row) {
        // Update the existing record
        const updateQuery = `
          UPDATE PerformanceRecord
          SET level_num = ?, comment = ?
          WHERE record_id = ?
        `;

        db.run(
          updateQuery,
          [level_num, comment || null, row.record_id],
          function (err) {
            if (err) {
              console.error('Error updating performance record:', err.message);
              return res.status(500).json({ error: 'Failed to update performance record' });
            }
            res.status(200).json({ message: 'Performance record updated successfully', record_id: row.record_id });
          }
        );
      } else {
        // Insert a new record
        const insertQuery = `
          INSERT INTO PerformanceRecord (student_id, standard_num, benchmark_num, criteria_num, level_num, time_period_id, comment)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
          insertQuery,
          [student_id, standard_num, benchmark_num, criteria_num, level_num, time_period_id, comment || null],
          function (err) {
            if (err) {
              console.error('Error inserting performance record:', err.message);
              return res.status(500).json({ error: 'Failed to insert performance record' });
            }
            res.status(201).json({ message: 'Performance record created successfully', record_id: this.lastID });
          }
        );
      }
    }
  );
});

module.exports = router;