const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const db = require('./models/database');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Add a GET route for fetching students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      console.error('Error fetching students:', err.message);
      res.status(500).json({ error: 'Error fetching students' });
    } else {
      console.log('Sending students data:', rows);
      res.json({ students: rows });
    }
  });
});

const performanceRecordsRouter = require('./routes/performanceRecords');
app.use('/api/performance-records', performanceRecordsRouter);

const timePeriodsRouter = require('./routes/timePeriods');
app.use('/api/time-periods', timePeriodsRouter);

app.post('/api/students/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare('INSERT INTO Students (student_id, first_name, last_name, grade, class) VALUES (?, ?, ?, ?, ?)');

        results.forEach((row) => {
          stmt.run(
            row.StudentID,
            row.FirstName,
            row.LastName,
            row.Grade,
            row.Class,
            (err) => {
              if (err) {
                console.error('Error inserting student:', err);
              }
            }
          );
        });

        stmt.finalize();

        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            res.status(500).json({ error: 'Error importing students' });
          } else {
            res.json({ message: 'Students imported successfully' });
          }

          // After processing, delete the uploaded file
          fs.unlinkSync(req.file.path);
        });
      });
    });
});

// Import routers
const standardsRouter = require('./routes/standards');
const studentsRouter = require('./routes/students');
const trackingRouter = require('./routes/tracking');
const classesRouter = require('./routes/classes'); // Import the new classes router

// Register routers
app.use('/api/standards', standardsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/classes', classesRouter); // Register the new classes router

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
