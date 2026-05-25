import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

// Import Pages & Layout
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import IssueDiploma from './pages/Issue';
import VerifyDocument from './pages/Verify';
import UserManagement from './pages/UserManagement';
import IssuerDashboard from './pages/IssuerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Temporary Component (Placeholder)
const UnderConstruction = ({ title }) => (
  <Box sx={{ p: 5, textAlign: 'center' }}>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#2c3e50' }}>{title}</Typography>
    <Typography variant="subtitle1" sx={{ color: '#7f8c8d' }}>This page is currently under construction...</Typography>
  </Box>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (No Sidebar) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* GUEST ROUTES (Guest Sidebar Mode) */}
        <Route path="/guest" element={<DashboardLayout role="guest" />}>
          <Route path="verify" element={<VerifyDocument />} />
        </Route>

        {/* UNIVERSITY ADMIN ROUTES (University Sidebar Mode) */}
        <Route path="/university" element={<DashboardLayout role="university" />}>
          <Route path="dashboard" element={<IssuerDashboard />} />
          <Route path="issue" element={<IssueDiploma />} />
          <Route path="verify" element={<VerifyDocument />} />
        </Route>

        {/* SUPER ADMIN ROUTES (Admin Sidebar Mode) */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="issue" element={<IssueDiploma />} />
          <Route path="verify" element={<VerifyDocument />} />
          <Route path="settings" element={<UnderConstruction title="System Settings" />} />
        </Route>

        {/* Fallback if URL is not found, redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}