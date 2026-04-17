import React from 'react';
import { Box, Typography, Button, Container, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {/* Navbar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#2C3E50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
            VEDA <span style={{ color: '#1abc9c' }}>SYSTEM</span>
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ color: '#fff', borderColor: '#fff', '&:hover': { borderColor: '#1abc9c', color: '#1abc9c' }, fontWeight: 700 }}
            onClick={() => navigate('/login')}
          >
            LOGIN
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Content */}
      <Container maxWidth="md" sx={{ mt: 12, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#2C3E50', mb: 3 }}>
          Blockchain-Based Diploma Verification
        </Typography>
        <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 6, fontWeight: 400, lineHeight: 1.6 }}>
          A decentralized ecosystem ensuring the authenticity and security of academic credentials through transparent and tamper-proof Web3 technology.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/guest/verify')}
          sx={{ 
            backgroundColor: '#1abc9c', 
            py: 2, px: 6, 
            fontSize: '1.1rem', fontWeight: 800, letterSpacing: 1,
            '&:hover': { backgroundColor: '#16a085' },
            borderRadius: 2
          }}
        >
          VERIFY DIPLOMA
        </Button>
      </Container>
    </Box>
  );
}