import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config/config';

const Standards = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGradeBand, setSelectedGradeBand] = useState('K-2');

  useEffect(() => {
    fetchStandardsByGradeBand(selectedGradeBand);
  }, [selectedGradeBand]);

  const fetchStandardsByGradeBand = async (gradeBand) => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/standards/grade/${gradeBand}`);
      setStandards(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching standards by grade band:', err);
      setError('Failed to fetch standards. Please try again.');
    }
    setLoading(false);
  };

  const handleGradeBandChange = (event) => {
    setSelectedGradeBand(event.target.value);
  };

  // Group standards by their hierarchy
  const groupedStandards = standards.reduce((acc, item) => {
    // Group by standard number
    const standardKey = item.standard_num;
    if (!acc[standardKey]) {
      acc[standardKey] = {
        standard: null,
        benchmarks: {}
      };
    }
    
    // Standard level
    if (item.benchmark_num === 0 && item.criteria_num === 0 && item.level_num === 0) {
      acc[standardKey].standard = item;
    }
    
    // Benchmark level
    if (item.benchmark_num > 0 && item.criteria_num === 0 && item.level_num === 0) {
      if (!acc[standardKey].benchmarks[item.benchmark_num]) {
        acc[standardKey].benchmarks[item.benchmark_num] = {
          benchmark: item,
          criteria: [],
          levels: {}
        };
      }
    }
    
    // Criteria level
    if (item.criteria_num > 0) {
      acc[standardKey].benchmarks[item.benchmark_num].criteria.push(item);
    }
    
    // Assessment levels
    if (item.level_num > 0) {
      acc[standardKey].benchmarks[item.benchmark_num].levels[item.level_num] = item;
    }
    
    return acc;
  }, {});

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h2>Standards</h2>
      <select value={selectedGradeBand} onChange={handleGradeBandChange}>
        <option value="K-2">K-2</option>
        <option value="3-5">3-5</option>
        <option value="6-8">6-8</option>
      </select>

      {Object.entries(groupedStandards).map(([standardNum, data]) => (
        <div key={standardNum} className="standard-section">
          <h3>{data.standard?.title}: {data.standard?.description}</h3>
          
          {Object.entries(data.benchmarks).map(([benchmarkNum, benchmarkData]) => (
            <div key={benchmarkNum} className="benchmark-section">
              <h4>{benchmarkData.benchmark?.title}: {benchmarkData.benchmark?.description}</h4>
              
              {benchmarkData.criteria.map((criterion) => (
                <div key={criterion.id} className="criteria-section">
                  <h5>{criterion.title}</h5>
                  <p>{criterion.description}</p>
                  
                  <div className="assessment-levels">
                    <div className="level advanced">
                      <strong>Advanced:</strong> {benchmarkData.levels[3]?.description}
                    </div>
                    <div className="level proficient">
                      <strong>Proficient:</strong> {benchmarkData.levels[2]?.description}
                    </div>
                    <div className="level limited">
                      <strong>Limited:</strong> {benchmarkData.levels[1]?.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
export default Standards;