const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
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

app.post('/api/students/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Validate CSV structure
        if (!validateCsvStructure(results[0])) {
          return res.status(400).json({ message: 'Invalid CSV structure' });
        }

        // Start a transaction
        await db.run('BEGIN TRANSACTION');

        // Clear existing data
        await db.run('DELETE FROM students');

        // Insert new data
        for (const row of results) {
          await db.run(
            'INSERT INTO students (FirstName, LastName, Grade, Class) VALUES (?, ?, ?, ?)',
            [row.FirstName, row.LastName, row.Grade, row.Class]
          );
        }

        // Commit the transaction
        await db.run('COMMIT');

        res.json({ message: 'Students imported successfully' });
      } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ message: error.message });
      } finally {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
      }
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
