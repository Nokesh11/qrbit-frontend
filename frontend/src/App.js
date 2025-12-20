import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ProfessorDashboard from './ProfessorDashboard';
import StudentDashboard from './StudentDashboard';

function App() {
  return (
    <div>
      <nav style={{ padding: '10px', textAlign: 'center' }}>
        <Link to="/" style={{ margin: '10px' }}>Professor Dashboard</Link>
        <Link to="/student" style={{ margin: '10px' }}>Student Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProfessorDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </div>
  );
}

export default App;