import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, MenuItem
} from '@mui/material';
import { FaUserPlus, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';

export default function UserManagement() {
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State (Add/Edit)
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    university_name: '',
    email: '',
    password: '',
    wallet_address: '',
    status: 'Active'
  });

  const token = localStorage.getItem('veda_token');

  const fetchIssuers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/issuer/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch university accounts');
      const data = await response.json();
      setIssuers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuers();
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ university_name: '', email: '', password: '', wallet_address: '', status: 'Active' });
    setOpenModal(true);
  };

  const handleOpenEdit = (issuer) => {
    setEditMode(true);
    setSelectedId(issuer.id_issuer);
    setFormData({
      university_name: issuer.university_name,
      email: issuer.email,
      password: '', // Leave blank unless changing
      wallet_address: issuer.wallet_address,
      status: issuer.status
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const method = editMode ? 'PATCH' : 'POST';
    const url = editMode 
      ? `http://127.0.0.1:8000/api/issuer/${selectedId}` 
      : 'http://127.0.0.1:8000/api/issuer/register';

    // Clean up payload (don't send empty password during update)
    const payload = { ...formData };
    if (editMode && !payload.password) delete payload.password;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Operation failed');

      setSuccess(editMode ? 'Account updated successfully!' : 'University registered successfully!');
      fetchIssuers();
      handleCloseModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account? This cannot be undone if they haven\'t issued any diplomas.')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/issuer/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete');
      }

      setSuccess('Account deleted successfully!');
      fetchIssuers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 2 }}>
            <FaUserShield /> User Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#7f8c8d' }}>
            Manage authorized university accounts and their blockchain credentials.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<FaUserPlus />} 
          onClick={handleOpenAdd}
          sx={{ backgroundColor: '#1abc9c', '&:hover': { backgroundColor: '#16a085' }, fontWeight: 700, px: 3, py: 1 }}
        >
          Add New University
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && !openModal && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>University Name</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Wallet Address</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : issuers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography color="textSecondary">No university accounts found.</Typography>
                </TableCell>
              </TableRow>
            ) : issuers.map((issuer) => (
              <TableRow key={issuer.id_issuer} sx={{ '&:hover': { backgroundColor: '#fdfdfd' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{issuer.university_name}</TableCell>
                <TableCell>{issuer.email}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', backgroundColor: '#f0f2f5', p: 0.5, borderRadius: 1 }}>
                    {issuer.wallet_address}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={issuer.status} 
                    color={issuer.status === 'Active' ? 'success' : 'default'} 
                    size="small" 
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenEdit(issuer)}>
                    <FaEdit size={18} />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(issuer.id_issuer)}>
                    <FaTrash size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: '#2c3e50' }}>
          {editMode ? 'Edit University Account' : 'Register New University'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth label="University Name" name="university_name"
              margin="dense" required value={formData.university_name} onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Email Address" name="email" type="email"
              margin="dense" required value={formData.email} onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label={editMode ? "New Password (leave blank to keep current)" : "Password"} 
              name="password" type="password"
              margin="dense" required={!editMode} value={formData.password} onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Wallet Address (Web3)" name="wallet_address"
              margin="dense" required value={formData.wallet_address} onChange={handleChange}
              placeholder="0x..." sx={{ mb: 2 }}
            />
            {editMode && (
              <TextField
                select fullWidth label="Account Status" name="status"
                value={formData.status} onChange={handleChange}
                margin="dense"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} sx={{ color: '#7f8c8d' }}>Cancel</Button>
            <Button 
              type="submit" variant="contained" 
              sx={{ backgroundColor: '#1abc9c', '&:hover': { backgroundColor: '#16a085' }, fontWeight: 700 }}
            >
              {editMode ? 'Save Changes' : 'Register University'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}