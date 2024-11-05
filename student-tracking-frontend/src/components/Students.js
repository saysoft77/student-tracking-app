import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };
  const handleManageStudents = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleAddStudent = () => {
    // Implement add student functionality
    console.log('Add student clicked');
  };

  const handleRemoveStudent = () => {
    // Implement remove student functionality
    console.log('Remove student clicked');
  };

  const handleImportStudents = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post('http://localhost:3001/api/students/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        await fetchStudents();
        alert('Students imported successfully');
      } catch (error) {
        console.error('Error importing students:', error);
        alert('Failed to import students. Please try again.');
      } finally {
        setImporting(false);
      }
    }
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
            <button className="dialog-btn" onClick={handleAddStudent}>Add Student</button>
            <button className="dialog-btn" onClick={handleRemoveStudent}>Remove Student</button>
            <button 
              className="dialog-btn" 
              onClick={handleImportStudents}
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Import Students'}
            </button>
            <button onClick={handleCloseDialog} className="close-btn">Close</button>
          </div>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".csv"
      />
    </div>
  );
};

export default Students;

