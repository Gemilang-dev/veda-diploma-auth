import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // State untuk form
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // SATPAM LOGIN (Reverse Route Guard)
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem('veda_token');
    const role = localStorage.getItem('veda_role');

    // Jika user sudah punya token (sudah login)
    if (token) {
      // Tendang kembali ke dashboard menggunakan 'replace: true' agar tombol back mati
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'university') {
        navigate('/university/issue', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Tentukan URL API dan Role berdasarkan Toggle
      const apiUrl = isSuperAdmin 
        ? 'http://127.0.0.1:8000/api/auth/login' // Endpoint Super Admin
        : 'http://127.0.0.1:8000/api/issuer/login'; // Endpoint Kampus

      const userRole = isSuperAdmin ? 'admin' : 'university';
      const redirectPath = isSuperAdmin ? '/admin/dashboard' : '/university/issue';

      // 2. Siapkan Data
      const formData = new URLSearchParams();
      formData.append('username', emailOrUsername); 
      formData.append('password', password);

      // 3. Tembak API Backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Terjadi kesalahan saat login");
      }

      // 4. Simpan Token dan Role ke Local Storage Browser
      localStorage.setItem('veda_token', data.access_token);
      localStorage.setItem('veda_role', userRole);

      // ==========================================
      // 5. BONGKAR TOKEN JWT UNTUK MENGAMBIL ID
      // ==========================================
      // JWT dipisah dengan titik (.). Bagian indeks [1] adalah Payload.
      const payloadBase64 = data.access_token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64)); 

      // Simpan ID Issuer jika yang login adalah kampus
      if (decodedPayload.id_issuer) {
        localStorage.setItem('veda_issuer_id', decodedPayload.id_issuer);
      }

      // 6. Arahkan ke Dashboard
      navigate(redirectPath);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C3E50' }}>
      <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 400, borderRadius: 3, textAlign: 'center' }}>
        
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#34495e', mb: 1 }}>
          {isSuperAdmin ? 'Login as Administration Admin' : 'Login as University Admin'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 4 }}>
          Enter your credentials to access the system
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField 
            fullWidth 
            label={isSuperAdmin ? "Username Admin" : "Email Kampus"} 
            margin="normal" required 
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
          <TextField 
            fullWidth label="Password" type="password" 
            margin="normal" required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && (
            <Typography variant="body2" sx={{ color: '#e74c3c', mt: 1, textAlign: 'left', fontWeight: 600 }}>
              ❌ {error}
            </Typography>
          )}

          <Button 
            type="submit" fullWidth variant="contained" disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, backgroundColor: isSuperAdmin ? '#e74c3c' : '#1abc9c', fontWeight: 800 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
          </Button>
        </form>

        <Typography 
          variant="body2" 
          sx={{ color: '#3498db', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => {
            setIsSuperAdmin(!isSuperAdmin);
            setError(''); 
            setEmailOrUsername(''); // Kosongkan input saat ganti mode
            setPassword('');
          }}
        >
          {isSuperAdmin ? 'Login as University Admin?' : 'Login as Administration Admin?'}
        </Typography>

      </Paper>
    </Box>
  );
}