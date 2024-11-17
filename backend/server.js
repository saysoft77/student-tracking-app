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

// Create students table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS students (
  StudentID INTEGER PRIMARY KEY,
  FirstName TEXT,
  LastName TEXT,
  Grade INTEGER,
  Class TEXT
)`, (err) => {
  if (err) {
    console.error('Error creating students table:', err.message);
  } else {
    console.log('Students table created or already exists');

    // Check if the students table exists and log the row count
    db.get('SELECT COUNT(*) as count FROM students', (err, row) => {
      if (err) {
        console.error('Error checking students table:', err.message);
      } else {
        console.log('Students table exists with', row.count, 'rows');
      }
    });
  }
});

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

        const stmt = db.prepare('INSERT INTO students (StudentID, FirstName, LastName, Grade, Class) VALUES (?, ?, ?, ?, ?)');

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


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});app.get('/api/standards', (req, res) => {
  db.all('SELECT * FROM Standards', (err, rows) => {
    if (err) {
      console.error('Error fetching standards:', err.message);
      res.status(500).json({ error: 'Error fetching standards' });
    } else {
      res.json(rows);
    }
  });
});


const standardsRouter = require('./routes/standards');
app.use('/api/standards', standardsRouter);
