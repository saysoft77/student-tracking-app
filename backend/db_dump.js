const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.resolve(__dirname, 'tracking.db');

// Output file path
const outputPath = path.resolve(__dirname, 'dump.sql');

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Function to get all table names
function getTables() {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) reject(err);
      else resolve(tables.map(t => t.name));
    });
  });
}

// Function to get table schema
function getTableSchema(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) reject(err);
      else {
        const schema = columns.map(col => 
          `${col.name} ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`
        ).join(', ');
        resolve(`CREATE TABLE ${tableName} (${schema});`);
      }
    });
  });
}

// Function to get table data
function getTableData(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) reject(err);
      else {
        const inserts = rows.map(row => {
          const values = Object.values(row).map(val => 
            typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val
          ).join(', ');
          return `INSERT INTO ${tableName} VALUES (${values});`;
        });
        resolve(inserts.join('\n'));
      }
    });
  });
}

// Main function to generate the dump
async function generateDump() {
  try {
    const tables = await getTables();
    let dumpContent = '';

    for (const table of tables) {
      const schema = await getTableSchema(table);
      const data = await getTableData(table);
      dumpContent += `${schema}\n\n${data}\n\n`;
    }

    fs.writeFileSync(outputPath, dumpContent);
    console.log(`Dump file created successfully at ${outputPath}`);
  } catch (error) {
    console.error('Error generating dump:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

// Run the script
generateDump();