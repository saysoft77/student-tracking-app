const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('../models/database');

const upload = multer({ dest: 'uploads/' });

router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const insertOrUpdateStudent = db.prepare(`
        INSERT INTO students (StudentID, FirstName, LastName, Grade, Class)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(StudentID) DO UPDATE SET
          FirstName = excluded.FirstName,
          LastName = excluded.LastName,
          Grade = excluded.Grade,
          Class = excluded.Class
      `);

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        results.forEach((student) => {
          insertOrUpdateStudent.run(
            student.StudentID,
            student.FirstName,
            student.LastName,
            student.Grade,
            student.Class
          );
        });

        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error importing students:', err);
            res.status(500).json({ error: 'Error importing students' });
          } else {
            // Fetch the updated list of students
            db.all('SELECT * FROM students', [], (err, updatedStudentsList) => {
              if (err) {
                return res.status(500).json({ error: 'Error fetching updated students list.' });
              }
              res.json({ message: 'Students imported successfully', students: updatedStudentsList });
            });
          }

          // Delete the temporary file
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
      });
    });
});

module.exports = router;