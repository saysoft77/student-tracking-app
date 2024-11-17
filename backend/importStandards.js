const csv = require('csv-parse');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'tracking.db');
const importDb = new sqlite3.Database(dbPath);

const recreateAndImportStandards = () => {
  importDb.serialize(() => {
    importDb.run("DROP TABLE IF EXISTS Standards", (err) => {
      if (err) {
        console.log('Drop table error:', err);
        return;
      }
      console.log('Existing Standards table dropped');

      importDb.run(`
        CREATE TABLE Standards (
          id INTEGER PRIMARY KEY,
          grade_band TEXT,
          standard_num INTEGER,
          benchmark_num INTEGER,
          criteria_num INTEGER, 
          level_num INTEGER,
          title TEXT,
          description TEXT
        )
      `, (err) => {
        if (err) {
          console.log('Table creation error:', err);
          return;
        }
        console.log('Standards table created successfully');
        
        const fileStream = fs.createReadStream('./myData/NewColumns_AllStandards.csv');
        fileStream.pipe(csv.parse({ columns: true }))
          .on('data', (row) => {
            const sql = `INSERT INTO Standards (
              grade_band, 
              standard_num, 
              benchmark_num, 
              criteria_num,
              level_num,
              title,
              description
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

            importDb.run(sql, [
              row['Grade Band'],
              parseInt(row['Standard']),
              parseInt(row['Benchmark']),
              parseInt(row['Criteria']),
              parseInt(row['Level']),
              row['Title'],
              row['Description']
            ]);          })
          .on('end', () => {
            console.log('Standards import completed');
            importDb.close();
          });
      });
    });
  });
};

recreateAndImportStandards();
