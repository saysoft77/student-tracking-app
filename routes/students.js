const express = require('express');
const router = express.Router();
const db = require('../models/database');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });
router.get('/', (req, res) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while fetching students');
        }
        res.render('students', { title: 'Students', students: rows });
    });
});

router.get('/manage', (req, res) => {
    res.render('manage-students', { title: 'Manage Students' });
});

// POST route for importing students
router.post('/import', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Process the CSV data and insert into the database
            const insertPromises = results.map(student => {
                return new Promise((resolve, reject) => {
                    db.run('INSERT INTO students (FirstName, LastName, Grade, Class) VALUES (?, ?, ?, ?)',
                        [student.FirstName, student.LastName, student.Grade, student.Class],
                        function(err) {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            });

            Promise.all(insertPromises)
                .then(() => {
                    // Fetch the updated list of students
                    db.all('SELECT * FROM students', [], (err, updatedStudentsList) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error fetching updated students list.' });
                        }
                        res.json({ students: updatedStudentsList });
                    });
                })
                .catch(error => {
                    console.error('Error inserting students:', error);
                    res.status(500).json({ error: 'Error inserting students into the database.' });
                });

            // Delete the temporary file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });
        });
});

module.exports = router;