import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Students = ({ students, onImport }) => {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

useEffect(() => {
  console.log('Component mounted, fileInputRef:', fileInputRef);
}, []);

  useEffect(() => {
    onImport();
  }, [onImport]);

  const handleImportStudents = () => {
    console.log('handleImportStudents called');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      console.log('Triggering file input click');
      fileInput.click();
    } else {
      console.error('File input element not found');
    }
  };




  const handleFileChange = async (event) => {
    console.log('handleFileChange called');
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
        await onImport();
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
        <div>
          <input
            id="fileInput"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".csv"
          />



          <button 
            onClick={handleImportStudents}
            className="manage-btn" 
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import Students'}
          </button>

          <Link to="/manage-students" className="manage-btn">Manage Students</Link>
        </div>
      </div>
      <table id="studentTable">
        {/* ... table content ... */}
      </table>
    </div>
  );
};

export default Students;
