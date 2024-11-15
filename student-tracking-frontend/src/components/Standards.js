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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h2>Standards</h2>
      <select value={selectedGradeBand} onChange={handleGradeBandChange}>
        <option value="K-2">K-2</option>
        <option value="3-5">3-5</option>
        <option value="6-8">6-8</option>
        <option value="9-12">9-12</option>
      </select>
      <ul>
        {standards.map((standard) => (
          <li key={standard.standard_id}>
            {standard.description} (Category: {standard.category})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Standards;