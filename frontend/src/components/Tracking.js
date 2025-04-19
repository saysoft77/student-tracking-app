import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Tracking = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    // Fetch combined student and class data from the backend
    const fetchClassData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/classes');
        setStudents(response.data.data);
        setFilteredStudents(response.data.data); // Initialize filtered students
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };
    fetchClassData();
  }, []);

  // Handle search input
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredStudents(
      students.filter(
        (student) =>
          student.first_name.toLowerCase().includes(value) || // Search by student first name
          student.last_name.toLowerCase().includes(value) || // Search by student last name
          student.class.toLowerCase().includes(value) || // Search by teacher name
          student.grade.toString().toLowerCase().includes(value) // Search by grade
      )
    );
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredStudents(sortedStudents);
  };

  return (
    <div>
      <h1>Student Progress Tracking</h1>

      {/* Search Field */}
      <input
        type="text"
        placeholder="Search by student name, teacher name, or grade..."
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
      />

      {/* Table */}
      <table border="1">
        <thead>
          <tr>
            <th onClick={() => handleSort('first_name')}>First Name</th>
            <th onClick={() => handleSort('last_name')}>Last Name</th>
            <th onClick={() => handleSort('grade')}>Grade</th>
            <th onClick={() => handleSort('class')}>Class (Teacher Name)</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={`student-${student.student_id}`}>
              <td>{student.first_name}</td>
              <td>{student.last_name}</td>
              <td>{student.grade}</td>
              <td>{student.class}</td> {/* Teacher name */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tracking;
