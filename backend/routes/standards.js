const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get standards by grade band
router.get('/grade/:gradeBand', (req, res) => {
  const gradeBand = req.params.gradeBand;
  console.log('Request received for grade band:', gradeBand);
  
  db.all(
    'SELECT * FROM Standards WHERE grade_band = ? ORDER BY standard_num, benchmark_num, criteria_num, level_num',
    [gradeBand],
    (err, rows) => {
      if (err) {
        console.log('Database error details:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`Found ${rows?.length} records`);
      res.json(rows);
    }
  );
});

// Get all standards
router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM Standards ORDER BY grade_band, standard_num, benchmark_num, criteria_num, level_num', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  )
});

module.exports = router
