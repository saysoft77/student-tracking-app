const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = require('../models/database');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ students: rows });
  });
});

app.post('/api/import-students', (req, res) => {
  const sourceDbPath = path.resolve(__dirname, '../data/students.db');
  const tempDb = new sqlite3.Database(sourceDbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error opening source database' });
    }

    tempDb.all('SELECT * FROM students', [], (err, rows) => {
      if (err) {
        tempDb.close();
        return res.status(500).json({ error: 'Error reading from source database' });
      }

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare('INSERT OR REPLACE INTO students (StudentID, FirstName, LastName, Grade, Class) VALUES (?, ?, ?, ?, ?)');
        rows.forEach((row) => {
          stmt.run(row.StudentID, row.FirstName, row.LastName, row.Grade, row.Class);
        });
        stmt.finalize();

        db.run('COMMIT', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error committing transaction' });
          }
          res.json({ message: 'Students imported successfully', count: rows.length });
        });
      });

      tempDb.close();
    });
  });
});

function validateCsvStructure(firstRow) {
  const requiredColumns = ['FirstName', 'LastName', 'Grade', 'Class'];
  return requiredColumns.every(column => column in firstRow);
}

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

