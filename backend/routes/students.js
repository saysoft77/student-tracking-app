const express = require('express');
const router = express.Router();
const db = require('../models/database');

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

module.exports = router;
