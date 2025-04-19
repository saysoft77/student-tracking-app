const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const assignClassIds = async () => {
  // Resolve the path to the tracking.db file
  const dbPath = path.resolve(__dirname, '../tracking.db');
  const db = new sqlite3.Database(dbPath);

  try {
    // Fetch all students
    const students = await new Promise((resolve, reject) => {
      db.all('SELECT student_id FROM Students', (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    if (students.length === 0) {
      console.log('No students found in the database.');
      return;
    }

    // Define the range of class IDs
    const classIds = Array.from({ length: 18 }, (_, i) => 37 + i); // [37, 38, ..., 54]
    const totalClassIds = classIds.length;

    // Assign class IDs evenly to students
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare('UPDATE Students SET class_id = ? WHERE student_id = ?');

        students.forEach((student, index) => {
          const classId = classIds[index % totalClassIds]; // Distribute class IDs evenly
          stmt.run(classId, student.student_id, (err) => {
            if (err) {
              console.error(`Error updating student ${student.student_id}:`, err.message);
            } else {
              console.log(`Assigned class_id ${classId} to student_id ${student.student_id}`);
            }
          });
        });

        stmt.finalize((err) => {
          if (err) {
            return reject(err);
          }
          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              return reject(commitErr);
            }
            resolve();
          });
        });
      });
    });

    console.log('Class IDs have been assigned to all students successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
};

assignClassIds();