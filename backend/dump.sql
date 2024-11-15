CREATE TABLE Student (student_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, grade INTEGER NOT NULL, class TEXT NOT NULL);



CREATE TABLE sqlite_sequence (name , seq );



CREATE TABLE Standard (standard_id INTEGER PRIMARY KEY, description TEXT NOT NULL, category TEXT NOT NULL);



CREATE TABLE Benchmark (benchmark_id INTEGER PRIMARY KEY, standard_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL);



CREATE TABLE Criteria (criteria_id INTEGER PRIMARY KEY, benchmark_id INTEGER NOT NULL, level TEXT NOT NULL, description TEXT NOT NULL);



CREATE TABLE TimePeriod (time_period_id INTEGER PRIMARY KEY, semester_name TEXT NOT NULL, quarter INTEGER NOT NULL, school_year TEXT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL);



CREATE TABLE PerformanceRecord (record_id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, benchmark_id INTEGER NOT NULL, criteria_id INTEGER NOT NULL, time_period_id INTEGER NOT NULL, date_assessed DATE, comments TEXT);



