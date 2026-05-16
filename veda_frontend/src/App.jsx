import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

// Import Pages & Layout
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import IssueDiploma from './pages/Issue'; // Sesuaikan lokasi file Issue.jsx Anda
import VerifyDocument from './pages/Verify';
import UserManagement from './pages/UserManagement';

// Komponen Sementara (Placeholder)
const UnderConstruction = ({ title }) => (
  <Box sx={{ p: 5, textAlign: 'center' }}>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#2c3e50' }}>{title}</Typography>
    <Typography variant="subtitle1" sx={{ color: '#7f8c8d' }}>Halaman ini sedang dalam konstruksi...</Typography>
  </Box>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (Tanpa Sidebar) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* GUEST ROUTES (Sidebar mode Guest) */}
        <Route path="/guest" element={<DashboardLayout role="guest" />}>
          <Route path="verify" element={<VerifyDocument />} />
        </Route>

        {/* UNIVERSITY ADMIN ROUTES (Sidebar mode Univ) */}
        <Route path="/university" element={<DashboardLayout role="university" />}>
          <Route path="issue" element={<IssueDiploma />} />
          <Route path="verify" element={<VerifyDocument />} />
        </Route>

        {/* SUPER ADMIN ROUTES (Sidebar mode Admin) */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route path="dashboard" element={<UnderConstruction title="Admin Dashboard" />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="issue" element={<IssueDiploma />} />
          <Route path="verify" element={<VerifyDocument />} />
          <Route path="settings" element={<UnderConstruction title="System Settings" />} />
        </Route>

        {/* Fallback jika URL tidak ditemukan, kembalikan ke Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}