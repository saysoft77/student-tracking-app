import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Standards = () => {
  const [standards, setStandards] = useState([]);
  const [selectedGradeBand, setSelectedGradeBand] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedBenchmark, setSelectedBenchmark] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [standardDescription, setStandardDescription] = useState('');
  const [benchmarkDescription, setBenchmarkDescription] = useState('');
  const [criteriaDescription, setCriteriaDescription] = useState('');

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    const response = await axios.get('http://localhost:3001/api/standards');
    setStandards(response.data);
  };

  const gradeBands = [...new Set(standards.map(s => s.grade_band))];
  
  const filteredStandards = standards.filter(s => s.grade_band === selectedGradeBand);
  const uniqueStandardNums = [...new Set(filteredStandards.map(s => s.standard_num))];
  
  const filteredBenchmarks = filteredStandards.filter(s => 
    s.standard_num === parseInt(selectedStandard) && 
    s.benchmark_num > 0
  );
  const uniqueBenchmarks = [...new Set(filteredBenchmarks.map(s => s.benchmark_num))];

  const filteredCriteria = filteredBenchmarks.filter(s => 
    s.benchmark_num === parseInt(selectedBenchmark) && 
    s.criteria_num > 0
  );
  const uniqueCriteria = [...new Set(filteredCriteria.map(s => s.criteria_num))];

  const getLevelsForCriteria = (criteriaNum) => {
    console.log('Selected Criteria:', criteriaNum);
    console.log('Filtered Criteria:', filteredCriteria);

    const levels = filteredCriteria.filter(s => {
      const match = s.criteria_num === parseInt(criteriaNum) && s.level_num > 0;
      console.log(`Checking item: `, s, `Match: ${match}`);
      return match;
    }).sort((a, b) => b.level_num - a.level_num);

    console.log('Levels found:', levels);
    return levels;
  };


  const handleGradeBandChange = (e) => {
    setSelectedGradeBand(e.target.value);
    setSelectedStandard('');
    setSelectedBenchmark('');
    setSelectedCriteria('');
    setStandardDescription('');
    setBenchmarkDescription('');
    setCriteriaDescription('');
  };

  const handleStandardChange = (e) => {
    setSelectedStandard(e.target.value);
    setSelectedBenchmark('');
    setSelectedCriteria('');
    setBenchmarkDescription('');
    setCriteriaDescription('');
    const standard = filteredStandards.find(s => s.standard_num === parseInt(e.target.value));
    setStandardDescription(standard?.description || '');
  };

  const handleBenchmarkChange = (e) => {
    setSelectedBenchmark(e.target.value);
    setSelectedCriteria('');
    setCriteriaDescription('');
    const benchmark = filteredBenchmarks.find(s => s.benchmark_num === parseInt(e.target.value));
    setBenchmarkDescription(benchmark?.description || '');
  };

  const handleCriteriaChange = (e) => {
    setSelectedCriteria(e.target.value);
    const criteria = filteredCriteria.find(s => s.criteria_num === parseInt(e.target.value));
    setCriteriaDescription(criteria?.description || '');
  };

  return (
    <div className="standards-container">
      <h2>Standards</h2>
      <div className="standards-filters">
        <div className="filter-group">
          <label>Grade Band:</label>
          <select value={selectedGradeBand} onChange={handleGradeBandChange}>
            <option value="">Select Grade Band</option>
            {gradeBands.map(band => (
              <option key={band} value={band}>{band}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Standard:</label>
          <select 
            value={selectedStandard}
            onChange={handleStandardChange}
            disabled={!selectedGradeBand}
          >
            <option value="">Select Standard</option>
            {uniqueStandardNums.map(num => (
              <option key={num} value={num}>Standard {num}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Benchmark:</label>
          <select 
            value={selectedBenchmark}
            onChange={handleBenchmarkChange}
            disabled={!selectedStandard}
          >
            <option value="">Select Benchmark</option>
            {uniqueBenchmarks.map(num => (
              <option key={num} value={num}>Benchmark {num}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Criteria:</label>
          <select 
            value={selectedCriteria}
            onChange={handleCriteriaChange}
            disabled={!selectedBenchmark}
          >
            <option value="">Select Criteria</option>
            {uniqueCriteria.map(num => (
              <option key={num} value={num}>Criteria {num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="descriptions-container">
        <div className="description-box">
          <h3>Standard {selectedStandard}</h3>
          <p>{standardDescription || 'Select a standard to view description'}</p>
        </div>

        <div className="description-box">
          <h3>Benchmark {selectedBenchmark}</h3>
          <p>{benchmarkDescription || 'Select a benchmark to view description'}</p>
        </div>

        <div className="description-box">
          <div className="description-box">
            <h3>Criteria {selectedCriteria}</h3>
            <p>{criteriaDescription || 'Select a criteria to view description'}</p>
          </div>

          {selectedCriteria && (
            <div className="levels-container">
              <h3>Assessment Levels</h3>
              <div className="assessment-levels">
                {getLevelsForCriteria(selectedCriteria).map(level => (
                  <div key={level.level_num} className={`level ${level.level_num === 3 ? 'advanced' : level.level_num === 2 ? 'proficient' : 'limited'}`}>
                    <h4>{level.level_num === 3 ? 'Advanced' : level.level_num === 2 ? 'Proficient' : 'Limited'}</h4>
                    <p>{level.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    );
  };

  export default Standards;
