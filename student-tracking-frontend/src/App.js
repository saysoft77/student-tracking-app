import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import Students from './components/Students';
import Classes from './components/Classes';
import Standards from './components/Standards';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          <header className="header">
            <div className="hamburger" onClick={toggleNav}>☰</div>
            <h1>Student Tracking System</h1>
            <nav className={`nav ${isNavOpen ? 'open' : ''}`}>
              <Link to="/" onClick={toggleNav}>Home</Link>
              <Link to="/students" onClick={toggleNav}>Students</Link>
              <Link to="/classes" onClick={toggleNav}>Classes</Link>
              <Link to="/standards" onClick={toggleNav}>Standards</Link>
            </nav>
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/students" element={<Students />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/standards" element={<Standards />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
