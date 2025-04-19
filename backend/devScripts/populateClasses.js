const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const populateClasses = async () => {
  // Resolve the path to the tracking.db file
  const dbPath = path.resolve(__dirname, '../tracking.db');
  const db = new sqlite3.Database(dbPath);

  const classes = [
    { teacher_name: 'Alice Johnson', grade: 0 }, // Kindergarten
    { teacher_name: 'Bob Smith', grade: 0 }, // Kindergarten
    { teacher_name: 'Carol Williams', grade: 1 }, // 1st Grade
    { teacher_name: 'David Brown', grade: 1 }, // 1st Grade
    { teacher_name: 'Eve Jones', grade: 2 }, // 2nd Grade
    { teacher_name: 'Frank Garcia', grade: 2 }, // 2nd Grade
    { teacher_name: 'Grace Martinez', grade: 3 }, // 3rd Grade
    { teacher_name: 'Hank Rodriguez', grade: 3 }, // 3rd Grade
    { teacher_name: 'Ivy Hernandez', grade: 4 }, // 4th Grade
    { teacher_name: 'Jack Lopez', grade: 4 }, // 4th Grade
    { teacher_name: 'Karen Gonzalez', grade: 5 }, // 5th Grade
    { teacher_name: 'Leo Wilson', grade: 5 }, // 5th Grade
    { teacher_name: 'Mia Anderson', grade: 6 }, // 6th Grade
    { teacher_name: 'Nate Thomas', grade: 6 }, // 6th Grade
    { teacher_name: 'Olivia Taylor', grade: 7 }, // 7th Grade
    { teacher_name: 'Paul Moore', grade: 7 }, // 7th Grade
    { teacher_name: 'Quinn Jackson', grade: 8 }, // 8th Grade
    { teacher_name: 'Rachel White', grade: 8 }, // 8th Grade
  ];

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const stmt = db.prepare('INSERT INTO Classes (teacher_name, grade) VALUES (?, ?)');
    for (const cls of classes) {
      stmt.run(cls.teacher_name, cls.grade, (err) => {
        if (err) {
          console.error('Error inserting class:', err.message);
        } else {
          console.log(`Added class: Teacher - ${cls.teacher_name}, Grade - ${cls.grade}`);
        }
      });
    }
    stmt.finalize();

    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error committing transaction:', err.message);
      } else {
        console.log('All classes have been added successfully.');
      }
    });
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
};

populateClasses();