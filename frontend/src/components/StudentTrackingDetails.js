import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentTrackingDetails = () => {
  const { id } = useParams(); // Get the student ID from the URL
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

  // Utility function to map grade to grade band
  const getGradeBand = (grade) => {
    if (grade === 0) return 'K-2'; // Kindergarten
    if (grade >= 1 && grade <= 2) return 'K-2';
    if (grade >= 3 && grade <= 5) return '3-5';
    if (grade >= 6 && grade <= 8) return '6-8';
    if (grade >= 9 && grade <= 12) return '9-12';
    return null; // No matching grade band
  };

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
    </div>
  );
};

export default StudentTrackingDetails;