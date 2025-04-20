const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all time periods
router.get('/', (req, res) => {
  db.all('SELECT * FROM TimePeriod', [], (err, rows) => {
    if (err) {
      console.error('Error fetching time periods:', err.message);
      res.status(500).json({ error: 'Failed to fetch time periods' });
    } else {
      res.json(rows);
    }
  });
});

module.exports = router;