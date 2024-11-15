const express = require('express');
const router = express.Router();
const db = require('../../models/database');

// GET all standards
router.get('/', (req, res) => {
  db.all('SELECT * FROM Standards', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET a single standard by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM Standards WHERE standard_id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Standard not found' });
      return;
    }
    res.json(row);
  });
});

// GET standards by grade_band
router.get('/grade/:gradeBand', (req, res) => {
  const gradeBand = req.params.gradeBand;
  db.all('SELECT * FROM Standards WHERE grade_band = ?', [gradeBand], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET standards by standard_number
router.get('/number/:standardNumber', (req, res) => {
  const standardNumber = req.params.standardNumber;
  db.all('SELECT * FROM Standards WHERE standard_number = ?', [standardNumber], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
