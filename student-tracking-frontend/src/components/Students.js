import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/students');
        setStudents(response.data.students);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleManageStudents = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <div className="students-container">
      <div className="header-container">
        <h2>Students</h2>
        <button onClick={handleManageStudents} className="manage-btn">Manage Students</button>
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

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Manage Students</h3>
            <button className="dialog-btn">Add Student</button>
            <button className="dialog-btn">Remove Student</button>
            <button className="dialog-btn">Import Students</button>
            <button onClick={handleCloseDialog} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;