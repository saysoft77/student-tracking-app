const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = require('../models/database');
// Add this near the top of your file, after initializing the database
db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
  if (err) {
    console.error('Error checking students table:', err);
    return;
  }

  if (row.count === 0) {
    const sampleStudents = [
      { StudentID: 1, FirstName: 'John', LastName: 'Doe', Grade: 10, Class: 'A' },
      { StudentID: 2, FirstName: 'Jane', LastName: 'Smith', Grade: 11, Class: 'B' },
      { StudentID: 3, FirstName: 'Bob', LastName: 'Johnson', Grade: 9, Class: 'C' },
    ];

    const insertStudent = db.prepare("INSERT INTO students (StudentID, FirstName, LastName, Grade, Class) VALUES (?, ?, ?, ?, ?)");

    sampleStudents.forEach(student => {
      insertStudent.run(student.StudentID, student.FirstName, student.LastName, student.Grade, student.Class);
    });

    insertStudent.finalize();

    console.log('Sample students added to the database');
  }
});

const app = express();
const upload = multer({ dest: 'backend/uploads/' });

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
         console.log(`CSV parsing complete. ${results.length} rows found.`);

         // Validate CSV structure
         if (!validateCsvStructure(results[0])) {
           return res.status(400).json({ message: 'Invalid CSV structure' });
         }

         // Start a transaction
         await db.run('BEGIN TRANSACTION');

         // Clear existing data
         await db.run('DELETE FROM students');

         // Insert new data
         let insertedCount = 0;
         for (const row of results) {
           try {
             await db.run(
               'INSERT INTO students (StudentID, FirstName, LastName, Grade, Class) VALUES (?, ?, ?, ?, ?)',
               [row.StudentID, row.FirstName, row.LastName, row.Grade, row.Class]
             );
             insertedCount++;
           } catch (insertError) {
             console.error('Error inserting row:', row, insertError);
           }
         }

         // Commit the transaction
         await db.run('COMMIT');

         console.log(`Inserted ${insertedCount} rows out of ${results.length}.`);
         res.json({ message: `Students imported successfully. ${insertedCount} rows inserted.` });
       } catch (error) {
         await db.run('ROLLBACK');
         console.error('Error during import:', error);
         res.status(500).json({ message: error.message });
       } finally {
         // Delete the uploaded file
         fs.unlinkSync(req.file.path);
       }
     });
 });


function validateCsvStructure(firstRow) {
  const requiredColumns = ['StudentID','FirstName', 'LastName', 'Grade', 'Class'];
  return requiredColumns.every(column => column in firstRow);
}

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

