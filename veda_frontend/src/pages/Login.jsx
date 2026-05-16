import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Form state
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // LOGIN GUARD (Reverse Route Guard)
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem('veda_token');
    const role = localStorage.getItem('veda_role');

    // If user is already logged in, redirect them away from the login page
    if (token) {
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'university') {
        navigate('/university/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Determine API URL and Role based on Toggle
      const apiUrl = isSuperAdmin 
        ? 'http://127.0.0.1:8000/api/auth/login' // Super Admin Endpoint
        : 'http://127.0.0.1:8000/api/issuer/login'; // University Endpoint

      const userRole = isSuperAdmin ? 'admin' : 'university';

      // 2. Prepare Data (FastAPI OAuth2 requires x-www-form-urlencoded format)
      const formData = new URLSearchParams();
      formData.append('username', emailOrUsername); 
      formData.append('password', password);

      // 3. Call Backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "An error occurred during login");
      }

      // 4. Store Token and Role in Browser Local Storage
      localStorage.setItem('veda_token', data.access_token);
      localStorage.setItem('veda_role', userRole);

      // ==========================================
      // 5. DECODE JWT TOKEN TO EXTRACT IDS
      // ==========================================
      const payloadBase64 = data.access_token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64)); 

      if (isSuperAdmin) {
        // Store Admin-specific data
        if (decodedPayload.id_admin) localStorage.setItem('veda_admin_id', decodedPayload.id_admin);
        if (decodedPayload.sub) localStorage.setItem('veda_admin_username', decodedPayload.sub);
      } else {
        // Store University-specific data
        if (decodedPayload.id_issuer) localStorage.setItem('veda_issuer_id', decodedPayload.id_issuer);
        if (decodedPayload.university_name) localStorage.setItem('veda_university_name', decodedPayload.university_name);
      }

      // 6. Redirect to Dashboard
      const redirectPath = isSuperAdmin ? '/admin/dashboard' : '/university/dashboard';
      navigate(redirectPath);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN HANDLER
  // ==========================================
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Google Login failed");
      }

      localStorage.setItem('veda_token', data.access_token);
      localStorage.setItem('veda_role', 'university');

      const payloadBase64 = data.access_token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64)); 
      
      if (decodedPayload.id_issuer) {
        localStorage.setItem('veda_issuer_id', decodedPayload.id_issuer);
      }
      if (decodedPayload.university_name) {
        localStorage.setItem('veda_university_name', decodedPayload.university_name);
      }

      navigate('/university/dashboard');
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
          {isSuperAdmin ? 'Login as System Administrator' : 'Login as University Admin'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 4 }}>
          Enter your credentials to access the system
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField 
            fullWidth 
            label={isSuperAdmin ? "Admin Username" : "University Email"} 
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
            sx={{ mt: 3, mb: 2, py: 1.5, backgroundColor: isSuperAdmin ? '#e74c3c' : '#1abc9c', '&:hover': { backgroundColor: isSuperAdmin ? '#c0392b' : '#16a085' }, fontWeight: 800 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
          </Button>
        </form>

        {/* GOOGLE LOGIN BUTTON (Only for University Admin) */}
        {!isSuperAdmin && (
          <>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="filled_blue"
                shape="rectangular"
              />
            </Box>
          </>
        )}

        <Typography 
          variant="body2" 
          sx={{ color: '#3498db', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => {
            setIsSuperAdmin(!isSuperAdmin);
            setError(''); 
            setEmailOrUsername(''); // Clear input on mode change
            setPassword('');
          }}
        >
          {isSuperAdmin ? 'Login as University Admin?' : 'Login as System Administrator?'}
        </Typography>

      </Paper>
    </Box>
  );
}