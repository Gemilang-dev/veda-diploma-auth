import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    CircularProgress, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Card,
    CardContent,
    LinearProgress,
    Divider
} from '@mui/material';
import { FaUniversity, FaGraduationCap, FaCheckCircle, FaHistory } from 'react-icons/fa';
import api from '../services/api';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminAnalytics();
    }, []);

    const fetchAdminAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/admin');
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch admin analytics:", err);
            setError("Failed to fetch system-wide analytics data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#2c3e50' }}>
                System Administrator Dashboard
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaUniversity size={40} color="#3498db" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.total_issuers}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Total Universities</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaCheckCircle size={40} color="#1abc9c" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.active_issuers}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Active Institutions</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaGraduationCap size={40} color="#9b59b6" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.total_diplomas}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Diplomas Secured</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaHistory size={40} color="#e67e22" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.recent_activity.length}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Global Recent Activity</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Top Universities by Issuance */}
                <Grid item xs={12} md={5}>
                    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Top Issuing Institutions</Typography>
                            {stats.top_issuers.length > 0 ? (
                                stats.top_issuers.map((issuer, index) => {
                                    const percentage = (issuer.count / stats.total_diplomas) * 100;
                                    return (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{issuer.university}</Typography>
                                                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>{issuer.count} diplomas</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={percentage} 
                                                sx={{ height: 8, borderRadius: 5, backgroundColor: '#ecf0f1', '& .MuiLinearProgress-bar': { backgroundColor: '#3498db' } }} 
                                            />
                                        </Box>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" sx={{ color: '#7f8c8d', textAlign: 'center', py: 5 }}>
                                    No issuance data available.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Global Recent Activity Table */}
                <Grid item xs={12} md={7}>
                    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent System-wide Issuance</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>University</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Degree</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.recent_activity.map((row, index) => (
                                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{row.student_name}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{row.university}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{row.degree}</TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(row.issued_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</TableCell>
                                            </TableRow>
                                        ))}
                                        {stats.recent_activity.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    No recent activity found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
