import React, { useState, useEffect } from 'react';
import { 
  Grid, OutlinedInput, FormLabel, Typography, Button, 
  Box, Paper, Divider, CircularProgress 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { issueDiplomaOnChain } from '../services/web3';
import { prepareDiploma } from '../services/api';
import QRCode from 'qrcode';

// Komponen Kalender MUI
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}));

const TinyLabel = styled(FormLabel)(() => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#7f8c8d',
  textTransform: 'uppercase',
  '& .MuiFormLabel-asterisk': {
    color: '#e74c3c'
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '0.9rem',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1),
  color: '#2C3E50',
  borderLeft: '4px solid #F6851B',
  paddingLeft: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px'
}));

export default function IssueDiploma() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  const [formData, setFormData] = useState({
    national_diploma_number: '',
    university_name: 'International Burch University',
    university_id_code: '041011',
    higher_education_program: 'Bachelor (B.Sc.)',
    study_program_name: 'Information Technology',
    study_program_id: '55201',
    student_name: '',
    student_id: '',
    place_of_birth: '',
    date_of_birth: null, 
    academic_degree: 'B.Sc. in IT',
    gpa: '',
    graduation_date: null, 
    issuance_location: 'Sarajevo',
    issuance_date: null, 
    signatory_name: 'Prof. Dr. Hasan Mahmud',
    signatory_title: 'Rector',
    id_issuer: '' 
  });

  // ==========================================
  // [BARU] SINKRONISASI ID ISSUER DARI LOGIN
  // ==========================================
  useEffect(() => {
    // Saat halaman dibuka, cari ID di Local Storage
    const savedIssuerId = localStorage.getItem('veda_issuer_id');
    
    if (savedIssuerId) {
      // Jika ketemu, update state id_issuer dengan angka tersebut
      setFormData(prevData => ({
        ...prevData,
        id_issuer: parseInt(savedIssuerId) // Ubah string ke angka
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, newValue) => {
    setFormData({ 
      ...formData, 
      [name]: newValue ? newValue.format('YYYY-MM-DD') : '' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Processing transaction...');
    
try {
      // 1. Kirim data ke Backend
      const prepareResponse = await prepareDiploma(formData);
      const responseData = prepareResponse.data ? prepareResponse.data : prepareResponse;
      
      // 2. Ekstrak Hash DAN Wallet dari Backend
      if (!responseData.blockchain_payload) throw new Error("Gagal mengambil data dari Backend.");
      
      const diploma_hash = responseData.blockchain_payload.diploma_hash;
      const required_wallet = responseData.blockchain_payload.wallet_address; // Ambil alamat wallet kampus
      
      // 3. Siapkan ABI Kontrak Anda (wajib ada karena web3.js memintanya)
      // (Sesuaikan nama fungsi ini jika berbeda dengan di Solidity Anda)
      const contractABI = [
          "function storeDiplomaHash(bytes32 diplomaHash, string universityId, string studentId) public"
      ];

      // 4. Panggil MetaMask dengan 6 PARAMETER LENGKAP
      setStatus('Menunggu Konfirmasi MetaMask...');
      await issueDiplomaOnChain(
          "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268", // 1. Address
          contractABI,                                  // 2. ABI
          diploma_hash,                                 // 3. Hash Ijazah
          formData.university_id_code,                  // 4. ID Universitas
          formData.student_id,                          // 5. NIM Mahasiswa
          required_wallet                               // 6. Wallet yang diizinkan
      );
      
      // 5. Sukses dan Generate QR
      setStatus('Success! Diploma Secured.');
      const qrUrl = `https://veda-verify.com/verify/${diploma_hash}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `Diploma_${formData.student_name}.png`;
      link.click();

    } catch (error) {
      console.error("Error Detail:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fff' }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#34495e', m: 0 }}>
                DIPLOMA ISSUANCE
              </Typography>
              <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Fill out the required information to mint a new diploma.
              </Typography>
          </Box>

          {/* SECTION 1: INSTITUTION */}
          <SectionTitle>Institution Info</SectionTitle>
          <Grid container spacing={3}>
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>National Diploma No.</TinyLabel>
              <OutlinedInput name="national_diploma_number" size="small" required value={formData.national_diploma_number} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>University Name</TinyLabel>
              <OutlinedInput name="university_name" size="small" required value={formData.university_name} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>University ID Code</TinyLabel>
              <OutlinedInput name="university_id_code" size="small" required value={formData.university_id_code} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Higher Ed Program</TinyLabel>
              <OutlinedInput name="higher_education_program" size="small" required value={formData.higher_education_program} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Study Program Name</TinyLabel>
              <OutlinedInput name="study_program_name" size="small" required value={formData.study_program_name} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Study Program ID</TinyLabel>
              <OutlinedInput name="study_program_id" size="small" required value={formData.study_program_id} onChange={handleChange} /></FormGrid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* SECTION 2: GRADUATE */}
          <SectionTitle>Graduate Info</SectionTitle>
          <Grid container spacing={3}>
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Full Name</TinyLabel>
              <OutlinedInput name="student_name" size="small" required value={formData.student_name} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Student ID (NIM)</TinyLabel>
              <OutlinedInput name="student_id" size="small" required value={formData.student_id} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Academic Degree</TinyLabel>
              <OutlinedInput name="academic_degree" size="small" required value={formData.academic_degree} onChange={handleChange} /></FormGrid>

            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Place of Birth</TinyLabel>
              <OutlinedInput name="place_of_birth" size="small" required value={formData.place_of_birth} onChange={handleChange} /></FormGrid>
            
            {/* KALENDER DATE OF BIRTH */}
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Date of Birth</TinyLabel>
              <DatePicker 
                format="DD/MM/YYYY"
                value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
                onChange={(newValue) => handleDateChange('date_of_birth', newValue)}
                slotProps={{ textField: { size: 'small', required: true } }}
              />
            </FormGrid>
            
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>GPA (IPK)</TinyLabel>
              <OutlinedInput name="gpa" size="small" required placeholder="3.90" value={formData.gpa} onChange={handleChange} /></FormGrid>
            
            {/* KALENDER GRADUATION DATE */}
            <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Graduation Date</TinyLabel>
              <DatePicker 
                format="DD/MM/YYYY"
                value={formData.graduation_date ? dayjs(formData.graduation_date) : null}
                onChange={(newValue) => handleDateChange('graduation_date', newValue)}
                slotProps={{ textField: { size: 'small', required: true } }}
              />
            </FormGrid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* SECTION 3: AUTHORIZATION */}
          <SectionTitle>Authorization</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <FormGrid item xs={12} md={6}><TinyLabel required>Issuance Location</TinyLabel>
              <OutlinedInput name="issuance_location" size="small" required value={formData.issuance_location} onChange={handleChange} /></FormGrid>
            
            {/* KALENDER ISSUANCE DATE */}
            <FormGrid item xs={12} md={6}><TinyLabel required>Issuance Date</TinyLabel>
              <DatePicker 
                format="DD/MM/YYYY"
                value={formData.issuance_date ? dayjs(formData.issuance_date) : null}
                onChange={(newValue) => handleDateChange('issuance_date', newValue)}
                slotProps={{ textField: { size: 'small', required: true } }}
              />
            </FormGrid>
            
            <FormGrid item xs={12} md={6}><TinyLabel required>Signatory Name (Rektor)</TinyLabel>
              <OutlinedInput name="signatory_name" size="small" required value={formData.signatory_name} onChange={handleChange} /></FormGrid>
            
            <FormGrid item xs={12} md={6}><TinyLabel required>Signatory Title</TinyLabel>
              <OutlinedInput name="signatory_title" size="small" required value={formData.signatory_title} onChange={handleChange} /></FormGrid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                  py: 1.5, 
                  px: 5,
                  backgroundColor: '#1abc9c', 
                  '&:hover': { backgroundColor: '#16a085' },
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  minWidth: '250px'
              }}
              >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'SECURE & DEPLOY DIPLOMA'}
              </Button>
          </Box>

          {status && (
            <Typography variant="subtitle2" sx={{ 
              mt: 3, display: 'block', textAlign: 'right', 
              color: status.includes('Error') ? '#e74c3c' : '#27ae60', 
              fontWeight: 700
            }}>
              {status}
            </Typography>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}