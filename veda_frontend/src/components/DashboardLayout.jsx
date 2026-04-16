import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

export default function DashboardLayout({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Menentukan data Profile berdasarkan Role
  const profile = {
    guest: { name: 'Guest', desc: 'Public Verifier' },
    university: { name: 'Super Admin', desc: 'Burch University' }, // Sesuai desain awal Anda
    admin: { name: 'System Admin', desc: 'Veda Core' }
  };

  // Menentukan Menu Sidebar berdasarkan Role
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

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#2C3E50', color: '#fff' } }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{profile[role].name}</Typography>
          <Typography variant="body2" sx={{ color: '#1abc9c' }}>{profile[role].desc}</Typography>
        </Box>
        <List sx={{ pt: 2 }}>
          {getMenus().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem 
                button key={item.title} onClick={() => navigate(item.path)}
                sx={{ 
                  mb: 1, 
                  backgroundColor: isActive ? '#1abc9c' : 'transparent',
                  '&:hover': { backgroundColor: isActive ? '#1abc9c' : 'rgba(255,255,255,0.05)' },
                  borderRight: isActive ? '4px solid #fff' : 'none'
                }}
              >
                <ListItemText primary={item.title} primaryTypographyProps={{ fontWeight: isActive ? 800 : 500, fontSize: '0.9rem' }} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* KONTEN UTAMA (Tempat halaman akan muncul) */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
         {/* <Outlet /> adalah portal tempat anak-anak router (Issue.jsx, dll) ditampilkan */}
        <Outlet /> 
      </Box>
    </Box>
  );
}