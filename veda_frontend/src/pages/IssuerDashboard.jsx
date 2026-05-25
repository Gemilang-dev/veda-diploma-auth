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
    LinearProgress
} from '@mui/material';
import { FaGraduationCap, FaAward, FaUniversity, FaHistory } from 'react-icons/fa';
import api from '../services/api';

const IssuerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/issuer');
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setError("Failed to fetch analytics data.");
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
                University Dashboard
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaGraduationCap size={40} color="#1abc9c" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.total}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Total Diplomas Issued</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaAward size={40} color="#3498db" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.degrees.length}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Academic Degree Types</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaUniversity size={40} color="#9b59b6" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.programs.length}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Active Study Programs</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <FaHistory size={40} color="#e67e22" style={{ marginBottom: '10px' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.recent.length}</Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Recent Activity</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Degrees Distribution */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Academic Degree Distribution</Typography>
                            {stats.degrees.map((degree) => {
                                const percentage = (degree.count / stats.total) * 100;
                                return (
                                    <Box key={degree.name} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{degree.name}</Typography>
                                            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>{degree.count} ({percentage.toFixed(1)}%)</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={percentage} 
                                            sx={{ height: 8, borderRadius: 5, backgroundColor: '#ecf0f1', '& .MuiLinearProgress-bar': { backgroundColor: '#1abc9c' } }} 
                                        />
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Programs Distribution */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Top Study Programs</Typography>
                            {stats.programs.sort((a, b) => b.count - a.count).slice(0, 5).map((program) => {
                                const percentage = (program.count / stats.total) * 100;
                                return (
                                    <Box key={program.name} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{program.name}</Typography>
                                            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>{program.count} diplomas</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={percentage} 
                                            sx={{ height: 8, borderRadius: 5, backgroundColor: '#ecf0f1', '& .MuiLinearProgress-bar': { backgroundColor: '#3498db' } }} 
                                        />
                                    </Box>
                                );
                            })}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activity Table */}
                <Grid item xs={12}>
                    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Issuance Activity</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Degree</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Study Program</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.recent.map((row, index) => (
                                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>{row.student_name}</TableCell>
                                                <TableCell>{row.student_id}</TableCell>
                                                <TableCell>{row.degree}</TableCell>
                                                <TableCell>{row.program}</TableCell>
                                                <TableCell>{new Date(row.issued_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                                            </TableRow>
                                        ))}
                                        {stats.recent.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No diplomas have been issued yet.</TableCell>
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

export default IssuerDashboard;
