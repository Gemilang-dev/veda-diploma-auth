import React, { useState, useEffect } from 'react';
import { 
  Grid, OutlinedInput, FormLabel, Typography, Button, 
  Box, Paper, Divider, CircularProgress, MenuItem, Select
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QRCode from 'qrcode';
import { issueDiplomaOnChain } from '../services/web3';
import { prepareDiploma, confirmDiploma } from '../services/api';
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
  '& .MuiFormLabel-asterisk': { color: '#e74c3c' }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '0.9rem',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1),
  color: '#2C3E50',
  borderLeft: '4px solid #1abc9c',
  paddingLeft: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px'
}));

// DROPDOWN DATA BASED ON USER INPUT
const programOptions = [
    { 
      label: "Bachelor Degree (S1)", 
      value: "Bachelor Degree", 
      degrees: [
        "BA – Bachelor of Arts", "BSc – Bachelor of Science", "BArch – Bachelor of Architecture", 
        "BAS – Bachelor of Applied Studies", "BB – Bachelor of Business", "BBA - Bachelor of Business Administration", 
        "BBA (Hons) – Bachelor of Business Administration with Honours", "BCom – Bachelor of Commerce", 
        "BCA – Bachelor of Computer Applications", "BD - Bachelor of Divinity", "BDes - Bachelor of Design", 
        "BEd – Bachelor of Education", "BEng – Bachelor of Engineering", "BFin – Bachelor of Finance", 
        "BFA - Bachelor of Fine Arts", "BIS – Bachelor of Information Systems", 
        "BJMC – Bachelor of Journalism & Mass Communication", "LLB – Bachelor of Laws", 
        "BLitt – Bachelor of Letters", "BSM – Bachelor in Management Studies", 
        "BMath - Bachelor of Mathematics", "BMus - Bachelor of Music", "BN - Bachelor of Nursing", 
        "BPharm - Bachelor of Pharmacy", "BPhil - Bachelor of Philosophy", "BPA - Bachelor of Public Administration", 
        "BPA – Bachelor of Performing Arts", "BPH – Bachelor of Public Health", "BSW – Bachelor of Social Work", 
        "BTech – Bachelor of Technology", "BTh – Bachelor of Theology", "MBBS – Bachelor of Medicine, Bachelor of Surgery"
      ] 
    },
    { 
      label: "Master Degree (S2)", 
      value: "Master Degree", 
      degrees: [
        "MA: Master of Arts", "MS / MSc: Master of Science", "MPhil: Master of Philosophy", "MRes: Master of Research", "MSt: Master of Studies",
        "MBA: Master of Business Administration", "EMBA: Executive Master of Business Administration", "MIM: Master in Management", 
        "MFin: Master of Finance", "MAcc / MAcy: Master of Accountancy", "MPA: Master of Public Administration", 
        "MPP: Master of Public Policy", "MRE: Master of Real Estate", "MIT / M.IT: Master of Information Technology", 
        "MSIT: Master of Science in Information Technology", "MEng: Master of Engineering", "MCS: Master of Computer Science", 
        "MDS: Master of Data Science", "MSDS: Master of Science in Data Science", "MFA: Master of Fine Arts", 
        "MDes: Master of Design", "MMus / MM: Master of Music", "MArch: Master of Architecture", "MLA: Master of Landscape Architecture", 
        "MPH: Master of Public Health", "MSN: Master of Science in Nursing", "MSW: Master of Social Work", "MHS: Master of Health Science", 
        "M.Psy: Master of Psychology", "MEd / EdM: Master of Education", "MAT: Master of Arts in Teaching", "LLM: Master of Laws", "MLS: Master of Legal Studies"
      ] 
    },
    { 
      label: "Doctoral Degree (S3)", 
      value: "Doctoral Degree", 
      degrees: ["Ph.D. - Doctor of Philosophy"] 
    }
];

export default function IssueDiploma() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [deployedHash, setDeployedHash] = useState('');
  
  const [formData, setFormData] = useState({
    national_diploma_number: '',
    university_name: '', 
    university_id_code: '',
    higher_education_program: '',
    study_program_name: '',
    study_program_id: '',
    student_name: '',
    student_id: '',
    place_of_birth: '',
    date_of_birth: null, 
    academic_degree: '',
    gpa: '',
    graduation_date: null, 
    issuance_location: '',
    issuance_date: null, 
    signatory_name: 'Prof. Dr. Hasan Mahmud',
    signatory_title: 'Rector',
    id_issuer: '' 
  });

  useEffect(() => {
    const savedIssuerId = localStorage.getItem('veda_issuer_id');
    const savedUnivName = localStorage.getItem('veda_university_name');
    if (savedIssuerId) {
      setFormData(prevData => ({
        ...prevData,
        id_issuer: parseInt(savedIssuerId),
        university_name: savedUnivName || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset degree if program changes
    if (name === "higher_education_program") {
        setFormData(prev => ({ ...prev, [name]: value, academic_degree: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (name, newValue) => {
    setFormData(prev => ({ ...prev, [name]: newValue ? newValue.format('YYYY-MM-DD') : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Preparing payload for Blockchain...');
    setIsSuccess(false);
    try {
      const prepareResponse = await prepareDiploma(formData);
      const responseData = prepareResponse.data ? prepareResponse.data : prepareResponse;
      if (!responseData.blockchain_payload) throw new Error("Failed to get response from Backend.");
      
      const diploma_hash = responseData.blockchain_payload.diploma_hash;
      const required_wallet = responseData.blockchain_payload.wallet_address; 
      const record_id = responseData.database_info.record_id;
      
      const contractABI = ["function storeDiplomaHash(bytes32 diplomaHash, string universityId, string studentId) public"];

      setStatus('Waiting for MetaMask Confirmation...');
      const txHash = await issueDiplomaOnChain(
          "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268", 
          contractABI,
          diploma_hash,
          formData.university_id_code,
          formData.student_id,
          required_wallet
      );
      
      setStatus('Syncing with University Database...');
      await confirmDiploma(record_id, txHash);

      setStatus('Generating QR Code...');
      const qrUrl = `https://veda-verify.com/verify/${diploma_hash}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `Diploma_${formData.student_name}.png`;
      link.click();

      setIsSuccess(true);
      setDeployedHash(txHash); // Use transaction hash here
      setStatus('');
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
                DIPLOMA ISSUANCE PORTAL
              </Typography>
          </Box>

          {!isSuccess && (
            <>
              <SectionTitle>Institution Info</SectionTitle>
              <Grid container spacing={3}>
                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>National Diploma No.</TinyLabel>
                  <OutlinedInput name="national_diploma_number" size="small" required value={formData.national_diploma_number} onChange={handleChange} />
                </FormGrid>
                
                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>University Name</TinyLabel>
                  <OutlinedInput name="university_name" size="small" required value={formData.university_name} onChange={handleChange} />
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>University ID Code</TinyLabel>
                  <OutlinedInput name="university_id_code" size="small" required value={formData.university_id_code} onChange={handleChange} />
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Higher Ed Program Level</TinyLabel>
                  <Select
                    name="higher_education_program"
                    value={formData.higher_education_program}
                    onChange={handleChange}
                    size="small"
                    required
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select Level</MenuItem>
                    {programOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Study Program Name</TinyLabel>
                  <OutlinedInput name="study_program_name" size="small" required value={formData.study_program_name} onChange={handleChange} />
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Study Program ID</TinyLabel>
                  <OutlinedInput name="study_program_id" size="small" required value={formData.study_program_id} onChange={handleChange} />
                </FormGrid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <SectionTitle>Graduate Info</SectionTitle>
              <Grid container spacing={3}>
                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Full Name</TinyLabel>
                  <OutlinedInput name="student_name" size="small" required value={formData.student_name} onChange={handleChange} />
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Student ID (NIM)</TinyLabel>
                  <OutlinedInput name="student_id" size="small" required value={formData.student_id} onChange={handleChange} />
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Academic Degree Qualification</TinyLabel>
                  <Select
                    name="academic_degree"
                    value={formData.academic_degree}
                    onChange={handleChange}
                    size="small"
                    required
                    displayEmpty
                    disabled={!formData.higher_education_program}
                  >
                    <MenuItem value="" disabled>Select Specific Degree</MenuItem>
                    {programOptions.find(p => p.value === formData.higher_education_program)?.degrees.map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormGrid>

                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Place of Birth</TinyLabel>
                  <OutlinedInput name="place_of_birth" size="small" required value={formData.place_of_birth} onChange={handleChange} />
                </FormGrid>
                
                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Date of Birth</TinyLabel>
                  <DatePicker 
                    format="DD/MM/YYYY"
                    value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
                    onChange={(newValue) => handleDateChange('date_of_birth', newValue)}
                    slotProps={{ textField: { size: 'small', required: true } }}
                  />
                </FormGrid>
                
                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>GPA</TinyLabel>
                  <OutlinedInput name="gpa" size="small" required placeholder="3.90" value={formData.gpa} onChange={handleChange} />
                </FormGrid>
                
                <FormGrid item xs={12} md={6} lg={4}>
                  <TinyLabel required>Graduation Date</TinyLabel>
                  <DatePicker 
                    format="DD/MM/YYYY"
                    value={formData.graduation_date ? dayjs(formData.graduation_date) : null}
                    onChange={(newValue) => handleDateChange('graduation_date', newValue)}
                    slotProps={{ textField: { size: 'small', required: true } }}
                  />
                </FormGrid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <SectionTitle>Authorization</SectionTitle>
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <FormGrid item xs={12} md={6}>
                  <TinyLabel required>Issuance Location</TinyLabel>
                  <OutlinedInput name="issuance_location" size="small" required value={formData.issuance_location} onChange={handleChange} />
                </FormGrid>
                <FormGrid item xs={12} md={6}>
                  <TinyLabel required>Issuance Date</TinyLabel>
                  <DatePicker 
                    format="DD/MM/YYYY"
                    value={formData.issuance_date ? dayjs(formData.issuance_date) : null}
                    onChange={(newValue) => handleDateChange('issuance_date', newValue)}
                    slotProps={{ textField: { size: 'small', required: true } }}
                  />
                </FormGrid>
                <FormGrid item xs={12} md={6}>
                  <TinyLabel required>Signatory Name</TinyLabel>
                  <OutlinedInput name="signatory_name" size="small" required value={formData.signatory_name} onChange={handleChange} />
                </FormGrid>
                <FormGrid item xs={12} md={6}>
                  <TinyLabel required>Signatory Title</TinyLabel>
                  <OutlinedInput name="signatory_title" size="small" required value={formData.signatory_title} onChange={handleChange} />
                </FormGrid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                    sx={{ py: 1.5, px: 5, backgroundColor: '#1abc9c', '&:hover': { backgroundColor: '#16a085' }, fontWeight: 800, borderRadius: '8px', minWidth: '250px' }}
                  >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'SECURE & DEPLOY DIPLOMA'}
                  </Button>
              </Box>
            </>
          )}

          {isSuccess && (
            <Box sx={{ mt: 2, p: 4, backgroundColor: '#f0fbf8', borderRadius: 2, border: '2px dashed #1abc9c' }}>
              <Typography variant="h5" sx={{ color: '#1abc9c', fontWeight: 900, mb: 1, textAlign: 'center' }}>
                🚀 DIPLOMA SUCCESSFULLY SECURED ON BLOCKCHAIN
              </Typography>
              <Divider sx={{ mb: 3, borderColor: '#1abc9c', opacity: 0.2 }} />
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Full Name</Typography><Typography fontWeight="700">{formData.student_name}</Typography></Grid>
                <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Level</Typography><Typography fontWeight="700">{formData.higher_education_program}</Typography></Grid>
                <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Degree</Typography><Typography fontWeight="700">{formData.academic_degree}</Typography></Grid>
                <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">GPA</Typography><Typography fontWeight="700">{formData.gpa}</Typography></Grid>
              </Grid>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button variant="outlined" onClick={() => { setIsSuccess(false); setDeployedHash(''); setFormData({...formData, student_name: '', student_id: '', national_diploma_number: '', gpa: ''}); }} sx={{ color: '#1abc9c', borderColor: '#1abc9c', fontWeight: 800, px: 4 }}>
                    ISSUE ANOTHER DIPLOMA
                  </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
