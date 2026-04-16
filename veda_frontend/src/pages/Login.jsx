import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  // State untuk menentukan form mana yang aktif. Default: false (University Admin)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Di sinilah nanti Anda memasang logika API Login sesungguhnya
    // Untuk sekarang, kita arahkan langsung ke dashboard sesuai role
    if (isSuperAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/university/issue');
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
          <TextField fullWidth label="Email Address" margin="normal" required />
          <TextField fullWidth label="Password" type="password" margin="normal" required />
          
          <Button 
            type="submit" fullWidth variant="contained" 
            sx={{ mt: 3, mb: 2, py: 1.5, backgroundColor: isSuperAdmin ? '#e74c3c' : '#1abc9c', fontWeight: 800 }}
          >
            LOGIN
          </Button>
        </form>

        {/* Text Toggle antar form */}
        <Typography 
          variant="body2" 
          sx={{ color: '#3498db', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => setIsSuperAdmin(!isSuperAdmin)}
        >
          {isSuperAdmin ? 'Login as University Admin?' : 'Login as Administration Admin?'}
        </Typography>

      </Paper>
    </Box>
  );
}