import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentTrackingDetails = () => {
  const { id } = useParams(); // Get the student ID from the URL
  const navigate = useNavigate(); // Hook for navigation
  const [student, setStudent] = useState(null);
  const [standards, setStandards] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedBenchmark, setSelectedBenchmark] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [filteredStandards, setFilteredStandards] = useState([]);
  const [filteredBenchmarks, setFilteredBenchmarks] = useState([]);
  const [filteredCriteria, setFilteredCriteria] = useState([]);
  const [standardDescription, setStandardDescription] = useState('');
  const [benchmarkDescription, setBenchmarkDescription] = useState('');
  const [criteriaDescription, setCriteriaDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls dialog visibility
  const [selectedLevel, setSelectedLevel] = useState(null); // Stores the selected assessment level
  const [comment, setComment] = useState(''); // Stores the entered comment
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentSemester, setCurrentSemester] = useState('');
  const [currentQuarter, setCurrentQuarter] = useState('');
  const [timePeriodId, setTimePeriodId] = useState(null);

  // Utility function to map grade to grade band
  const getGradeBand = (grade) => {
    if (grade === 0) return 'K-2'; // Kindergarten
    if (grade >= 1 && grade <= 2) return 'K-2';
    if (grade >= 3 && grade <= 5) return '3-5';
    if (grade >= 6 && grade <= 8) return '6-8';
    if (grade >= 9 && grade <= 12) return '9-12';
    return null; // No matching grade band
  };

  const openDialog = (level) => {
    setSelectedLevel(level); // Set the selected level
    setComment(''); // Clear any previous comment
    setIsDialogOpen(true); // Open the dialog
  };

  const saveComment = async () => {
    if (!timePeriodId) {
      console.error('No time period resolved. Cannot save performance record.');
      return;
    }

    const payload = {
      student_id: student.student_id,
      standard_num: selectedStandard,
      benchmark_num: selectedBenchmark,
      criteria_num: selectedCriteria,
      level_num: selectedLevel.level_num,
      time_period_id: timePeriodId,
      comment,
    };

    try {
      await axios.post('http://localhost:3001/api/performance-records', payload);
      setIsDialogOpen(false); // Close the dialog
      navigate('/tracking'); // Redirect to the tracking page
    } catch (error) {
      console.error('Error saving performance record:', error);
    }
  };

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
        period.semester === semester &&
        period.quarter === quarter &&
        period.school_year === schoolYear
    );

    if (matchingPeriod) {
      console.log('Matching time period found:', matchingPeriod);
      setTimePeriodId(matchingPeriod.time_period_id);
    } else {
      console.error('No matching time period found.');
      setTimePeriodId(null);
    }
  };

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
    deriveSemesterAndQuarter(today);
  }, []);

  const [timePeriods, setTimePeriods] = useState([]);

  useEffect(() => {
    const fetchTimePeriods = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/time-periods');
        setTimePeriods(response.data);
      } catch (error) {
        console.error('Error fetching time periods:', error);
      }
    };

    fetchTimePeriods();
  }, []);

  useEffect(() => {
    if (timePeriods.length > 0) {
      console.log('Available time periods:', timePeriods);
      const today = new Date();
      setCurrentDate(today);
      deriveSemesterAndQuarter(today);
    }
  }, [timePeriods]);

  useEffect(() => {
    // Fetch student details
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/students/${id}`);
        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    // Fetch standards
    const fetchStandards = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/standards');
        setStandards(response.data);
      } catch (error) {
        console.error('Error fetching standards:', error);
      }
    };

    fetchStudent();
    fetchStandards();
  }, [id]);

  useEffect(() => {
    if (student && standards.length > 0) {
      const gradeBand = getGradeBand(student.grade); // Map the student's grade to a grade band
      const filtered = standards.filter((s) => s.grade_band === gradeBand);
      setFilteredStandards(filtered);
    }
  }, [student, standards]);

  useEffect(() => {
    // Filter benchmarks based on the selected standard
    const benchmarks = filteredStandards.filter(
      (s) => s.standard_num === parseInt(selectedStandard) && s.benchmark_num > 0
    );
    setFilteredBenchmarks(benchmarks);
  }, [selectedStandard, filteredStandards]);

  useEffect(() => {
    // Filter criteria based on the selected benchmark
    const criteria = filteredBenchmarks.filter(
      (s) => s.benchmark_num === parseInt(selectedBenchmark) && s.criteria_num > 0
    );
    setFilteredCriteria(criteria);
  }, [selectedBenchmark, filteredBenchmarks]);

  // Update standard description
  useEffect(() => {
    if (selectedStandard) {
      const standard = filteredStandards.find(
        (s) => s.standard_num === parseInt(selectedStandard)
      );
      setStandardDescription(standard ? standard.description : '');
    } else {
      setStandardDescription('');
    }
  }, [selectedStandard, filteredStandards]);

  // Update benchmark description
  useEffect(() => {
    if (selectedBenchmark) {
      const benchmark = filteredBenchmarks.find(
        (b) => b.benchmark_num === parseInt(selectedBenchmark)
      );
      setBenchmarkDescription(benchmark ? benchmark.description : '');
    } else {
      setBenchmarkDescription('');
    }
  }, [selectedBenchmark, filteredBenchmarks]);

  // Update criteria description
  useEffect(() => {
    if (selectedCriteria) {
      const criteria = filteredCriteria.find(
        (c) => c.criteria_num === parseInt(selectedCriteria)
      );
      setCriteriaDescription(criteria ? criteria.description : '');
    } else {
      setCriteriaDescription('');
    }
  }, [selectedCriteria, filteredCriteria]);

  // Get levels for the selected criteria
  const getLevelsForCriteria = (criteriaNum) => {
    if (!criteriaNum) return [];
    const levels = filteredCriteria
      .filter((s) => s.criteria_num === parseInt(criteriaNum) && s.level_num > 0)
      .sort((a, b) => b.level_num - a.level_num); // Sort by level number in descending order
    return levels;
  };

  if (!student) {
    return <p>Loading student details...</p>;
  }

  return (
    <div>
      <h1>Student Tracking Details</h1>
      <h2>{student.first_name} {student.last_name}</h2>
      <p>Grade: {student.grade}</p>

      {/* Standards Dropdown */}
      <label>
        Standard:
        <select
          value={selectedStandard}
          onChange={(e) => setSelectedStandard(e.target.value)}
        >
          <option value="">Select a standard</option>
          {[...new Set(filteredStandards.map((s) => s.standard_num))].map((standard) => (
            <option key={standard} value={standard}>
              Standard {standard}
            </option>
          ))}
        </select>
      </label>

      {/* Benchmarks Dropdown */}
      <label>
        Benchmark:
        <select
          value={selectedBenchmark}
          onChange={(e) => setSelectedBenchmark(e.target.value)}
          disabled={!selectedStandard}
        >
          <option value="">Select a benchmark</option>
          {[...new Set(filteredBenchmarks.map((s) => s.benchmark_num))].map((benchmark) => (
            <option key={benchmark} value={benchmark}>
              Benchmark {benchmark}
            </option>
          ))}
        </select>
      </label>

      {/* Criteria Dropdown */}
      <label>
        Criteria:
        <select
          value={selectedCriteria}
          onChange={(e) => setSelectedCriteria(e.target.value)}
          disabled={!selectedBenchmark}
        >
          <option value="">Select criteria</option>
          {[...new Set(filteredCriteria.map((s) => s.criteria_num))].map((criteria) => (
            <option key={criteria} value={criteria}>
              Criteria {criteria}
            </option>
          ))}
        </select>
      </label>

      {/* Descriptions */}
      <div>
        <h3>Descriptions</h3>
        <p><strong>Standard:</strong> {standardDescription || 'No standard selected'}</p>
        <p><strong>Benchmark:</strong> {benchmarkDescription || 'No benchmark selected'}</p>
        <p><strong>Criteria:</strong> {criteriaDescription || 'No criteria selected'}</p>
      </div>

      {/* Assessment Levels */}
      {selectedCriteria && (
        <div className="levels-container">
          <h3>Assessment Levels</h3>
          <div className="assessment-levels">
        {getLevelsForCriteria(selectedCriteria).map((level) => (
          <div
            key={level.level_num}
            className={`level ${
              level.level_num === 3
                ? 'advanced'
                : level.level_num === 2
                ? 'proficient'
                : 'limited'
            }`}
            onClick={() => openDialog(level)} // Open dialog on click
          >
            <h4>
              {level.level_num === 3
                ? 'Advanced'
                : level.level_num === 2
                ? 'Proficient'
                : 'Limited'}
            </h4>
            <p>{level.description}</p>
          </div>
        ))}
      </div>
        </div>
      )}

{isDialogOpen && (
  <div className="dialog-overlay">
    <div className="dialog-box">
      <h3>Enter Comment</h3>
      <p><strong>Student:</strong> {student.first_name} {student.last_name}</p>
      <p><strong>Standard:</strong> {standardDescription}</p>
      <p><strong>Benchmark:</strong> {benchmarkDescription}</p>
      <p><strong>Criteria:</strong> {criteriaDescription}</p>
      <p><strong>Level:</strong> {selectedLevel.level_num === 3 ? 'Advanced' : selectedLevel.level_num === 2 ? 'Proficient' : 'Limited'}</p>
      <p><strong>Current Date:</strong> {currentDate.toLocaleDateString()}</p>
      <p><strong>Semester:</strong> {currentSemester}</p>
      <p><strong>Quarter:</strong> {currentQuarter}</p>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your comment here..."
      />
      <button onClick={saveComment}>OK</button>
      <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
    </div>
  </div>
)}
    </div>
  );
};

export default StudentTrackingDetails;