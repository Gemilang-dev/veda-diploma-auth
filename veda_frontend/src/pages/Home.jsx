import React from 'react';
import { Box, Typography, Button, Container, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {/* Navbar Atas */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#2C3E50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
            VEDA <span style={{ color: '#1abc9c' }}>SYSTEM</span>
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ color: '#fff', borderColor: '#fff', '&:hover': { borderColor: '#1abc9c', color: '#1abc9c' } }}
            onClick={() => navigate('/login')}
          >
            LOGIN
          </Button>
        </Toolbar>
      </AppBar>

      {/* Konten Utama */}
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#2C3E50', mb: 3 }}>
          Verifikasi Ijazah Berbasis Blockchain
        </Typography>
        <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 6, fontWeight: 400 }}>
          Sistem terdesentralisasi untuk menjamin keaslian dan keamanan dokumen akademik menggunakan teknologi Web3 secara transparan dan anti-pemalsuan.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/guest/verify')}
          sx={{ 
            backgroundColor: '#1abc9c', 
            py: 2, px: 5, 
            fontSize: '1.1rem', fontWeight: 700,
            '&:hover': { backgroundColor: '#16a085' }
          }}
        >
          CHECK KEASLIAN IJAZAH
        </Button>
      </Container>
    </Box>
  );
}