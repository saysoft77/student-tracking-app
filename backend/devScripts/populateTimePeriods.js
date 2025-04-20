const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.resolve(__dirname, '../tracking.db');
const db = new sqlite3.Database(dbPath);

// Function to generate time periods for 20 years
const generateTimePeriods = () => {
  const timePeriods = [];
  const startYear = 2024;
  const endYear = startYear + 20;

  for (let year = startYear; year < endYear; year++) {
    const nextYear = year + 1;

    // Define quarters for the school year
    timePeriods.push({
      semester: `1`, // Semester 1
      quarter: 1, // Quarter 1
      school_year: `${year}-${nextYear}`,
      start_date: `${year}-08-21`,
      end_date: `${year}-10-15`,
    });

    timePeriods.push({
      semester: `1`, // Semester 1
      quarter: 2, // Quarter 2
      school_year: `${year}-${nextYear}`,
      start_date: `${year}-10-16`,
      end_date: `${year}-12-20`,
    });

    timePeriods.push({
      semester: `2`, // Semester 2
      quarter: 3, // Quarter 3
      school_year: `${year}-${nextYear}`,
      start_date: `${nextYear}-01-08`,
      end_date: `${nextYear}-03-15`,
    });

    timePeriods.push({
      semester: `2`, // Semester 2
      quarter: 4, // Quarter 4
      school_year: `${year}-${nextYear}`,
      start_date: `${nextYear}-03-16`,
      end_date: `${nextYear}-05-24`,
    });
  }

  return timePeriods;
};

// Function to clear the TimePeriod table
const clearTimePeriods = () => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM TimePeriod`, (err) => {
      if (err) {
        console.error('Error clearing TimePeriod table:', err.message);
        reject(err);
      } else {
        console.log('TimePeriod table cleared.');
        resolve();
      }
    });
  });
};

// Function to insert time periods into the database
const insertTimePeriods = (timePeriods) => {
  db.serialize(() => {
    const stmt = db.prepare(`
      INSERT INTO TimePeriod (semester, quarter, school_year, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    timePeriods.forEach((period) => {
      stmt.run(
        period.semester,
        period.quarter,
        period.school_year,
        period.start_date,
        period.end_date,
        (err) => {
          if (err) {
            console.error('Error inserting time period:', err.message);
          }
        }
      );
    });

    stmt.finalize(() => {
      console.log('Time periods inserted successfully.');
      db.close();
    });
  });
};

// Function to derive semester and quarter based on a date
const deriveSemesterAndQuarter = (date) => {
  const month = date.getMonth() + 1; // Months are 0-based
  const currentYear = date.getFullYear();
  const schoolYear = month >= 8 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

  // Determine semester and quarter
  let semester = '';
  let quarter = '';
  if (month >= 8 && month <= 10) {
    semester = '1'; // Fall Semester
    quarter = 1; // Quarter 1
  } else if (month >= 11 && month <= 12) {
    semester = '1'; // Fall Semester
    quarter = 2; // Quarter 2
  } else if (month >= 1 && month <= 3) {
    semester = '2'; // Spring Semester
    quarter = 3; // Quarter 3
  } else if (month >= 4 && month <= 5) {
    semester = '2'; // Spring Semester
    quarter = 4; // Quarter 4
  }

  console.log('Derived values:', { semester, quarter, schoolYear });
  console.log('Available time periods:', timePeriods);

  setCurrentSemester(semester);
  setCurrentQuarter(quarter);

  // Find the matching time period
  const matchingPeriod = timePeriods.find(
    (period) =>
      String(period.semester) === String(semester) &&
      String(period.quarter) === String(quarter) &&
      String(period.school_year) === String(schoolYear)
  );

  if (matchingPeriod) {
    console.log('Matching time period found:', matchingPeriod);
    setTimePeriodId(matchingPeriod.time_period_id);
  } else {
    console.error('No matching time period found.');
    setTimePeriodId(null);
  }
};

// Main function to clear and populate the TimePeriod table
const main = async () => {
  try {
    await clearTimePeriods(); // Clear the table first
    const timePeriods = generateTimePeriods(); // Generate new time periods
    insertTimePeriods(timePeriods); // Insert the new data
  } catch (err) {
    console.error('Error during time period population:', err.message);
    db.close();
  }
};

main();