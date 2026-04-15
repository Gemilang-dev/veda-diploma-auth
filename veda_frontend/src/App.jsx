import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
import Issue from './pages/Issue';
import Verify from './pages/Verify';

const App = () => {
    return (
        <Router>
            {/* Navigation Bar (Optional, for easy switching during development) */}
            <nav style={{ padding: '15px', backgroundColor: '#333', textAlign: 'center' }}>
                <a href="/issue" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontWeight: 'bold' }}>
                    🎓 Issue Diploma
                </a>
                <a href="/verify" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    🔍 Verify Diploma
                </a>
            </nav>

            {/* Route Definitions */}
            <Routes>
                {/* 1. Issuance Page */}
                <Route path="/issue" element={<Issue />} />

                {/* 2. Verification Page (Standard) */}
                <Route path="/verify" element={<Verify />} />

                {/* 3. Verification Page (With auto-populated Hash from QR Code) */}
                <Route path="/verify/:hash" element={<Verify />} />

                {/* 4. Default Route: Redirect root (/) to Issuance */}
                <Route path="/" element={<Navigate to="/issue" replace />} />
                
                {/* 5. Fallback for undefined routes (404) */}
                <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</h2>} />
            </Routes>
        </Router>
    );
};

export default App;