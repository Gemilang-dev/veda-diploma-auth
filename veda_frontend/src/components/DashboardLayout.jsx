import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Divider } from '@mui/material';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';

const drawerWidth = 260;

export default function DashboardLayout({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const hasToken = !!localStorage.getItem('veda_token');

  if (role !== 'guest' && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  const profile = {
    guest: { name: 'Guest', desc: 'Public Verifier' },
    university: { name: 'University Admin', desc: 'Issuer Portal' }, 
    admin: { name: 'System Administrator', desc: 'Veda Core' }
  };

  const getMenus = () => {
    if (role === 'guest') return [{ title: 'Verify Document', path: '/guest/verify' }];
    if (role === 'university') return [
      { title: 'Issue Diploma', path: '/university/issue' },
      { title: 'Verify Document', path: '/university/verify' }
    ];
    if (role === 'admin') return [
      { title: 'Admin Dashboard', path: '/admin/dashboard' },
      { title: 'User Management', path: '/admin/users' },
      { title: 'Issue Diploma', path: '/admin/issue' },
      { title: 'Verify Document', path: '/admin/verify' },
      { title: 'Settings', path: '/admin/settings' }
    ];
    return [];
  };

  const handleLogout = () => {
    localStorage.removeItem('veda_token');
    localStorage.removeItem('veda_role');
    localStorage.removeItem('veda_issuer_id');
    localStorage.removeItem('veda_university_name');
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <Drawer
        variant="permanent"
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0, 
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            backgroundColor: '#2C3E50', 
            color: '#fff',
            display: 'flex',           
            flexDirection: 'column'   
          } 
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {role === 'university' ? (localStorage.getItem('veda_university_name') || profile[role].name) : profile[role].name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#1abc9c' }}>{profile[role].desc}</Typography>
        </Box>

        <List sx={{ pt: 2, flexGrow: 1 }}>
          {getMenus().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    backgroundColor: isActive ? '#1abc9c' : 'transparent',
                    '&:hover': { backgroundColor: isActive ? '#1abc9c' : 'rgba(255,255,255,0.05)' },
                    borderRight: isActive ? '4px solid #fff' : 'none'
                  }}
                >
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ fontWeight: isActive ? 800 : 500, fontSize: '0.9rem' }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ p: 2 }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
          <ListItem disablePadding>
            {role !== 'guest' ? (
              <ListItemButton 
                onClick={handleLogout}
                sx={{ 
                  backgroundColor: 'rgba(231, 76, 60, 0.1)', 
                  color: '#e74c3c',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#e74c3c', color: '#fff' }
                }}
              >
                <ListItemText primary="Logout System" primaryTypographyProps={{ fontWeight: 800, textAlign: 'center' }} />
              </ListItemButton>
            ) : (
              <ListItemButton 
                onClick={() => navigate('/')}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <ListItemText primary="Back to Home" primaryTypographyProps={{ fontWeight: 600, textAlign: 'center' }} />
              </ListItemButton>
            )}
          </ListItem>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet /> 
      </Box>
    </Box>
  );
}