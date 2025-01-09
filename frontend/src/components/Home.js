import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Student Tracking System</h1>
      <div className="card-container">
        <Link to="/students" className="card">
          <h2>Students</h2>
          <p>Manage and view student information</p>
        </Link>
        <Link to="/classes" className="card">
          <h2>Classes</h2>
          <p>Manage and view class information</p>
        </Link>
        <Link to="/standards" className="card">
          <h2>Standards</h2>
          <p>View and manage academic standards</p>
        </Link>
        <Link to="/tracking" className="card">
          <h2>Tracking</h2>
          <p>Track student progress</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;