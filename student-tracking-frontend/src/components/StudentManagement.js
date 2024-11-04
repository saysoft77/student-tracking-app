import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import Classes from './Classes';
import Standards from './Standards';
import ManageStudents from './ManageStudents';

const Students = ({ students, onImport }) => {
  useEffect(() => {
    onImport();
  }, [onImport]);

  return (
    <div className="students-container">
      <div className="header-container">
        <h2>Students</h2>
        <Link to="/manage-students" className="manage-btn">Manage Students</Link>
      </div>
      <table id="studentTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Grade</th>
            <th>Class</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.StudentID}>
              <td>{student.StudentID}</td>
              <td>{student.FirstName}</td>
              <td>{student.LastName}</td>
              <td>{student.Grade}</td>
              <td>{student.Class}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const importStudents = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/api/import-students');
      await fetchStudents();
    } catch (error) {
      console.error('Error importing students:', error);
      setError('Failed to import students. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Router>
      <div className="app-container">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/students">Students</Link></li>
            <li><Link to="/classes">Classes</Link></li>
            <li><Link to="/standards">Standards</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={
              loading ? (
                <p>Loading students...</p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : (
                <Students students={students} onImport={importStudents} />
              )
            } />
            <Route path="/manage-students" element={<ManageStudents onImport={fetchStudents} />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/standards" element={<Standards />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default StudentManagement;
