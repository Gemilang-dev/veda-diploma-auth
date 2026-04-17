// // import React, { useState, useEffect } from 'react';
// // import { 
// //   Grid, OutlinedInput, FormLabel, Typography, Button, 
// //   Box, Paper, Divider, CircularProgress 
// // } from '@mui/material';
// // import { styled } from '@mui/material/styles';
// // import QRCode from 'qrcode';

// // // Import Services (Sesuaikan dengan path folder Anda)
// // import { issueDiplomaOnChain } from '../services/web3';
// // import { prepareDiploma } from '../services/api';

// // // MUI Date Picker
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// // import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// // import dayjs from 'dayjs';

// // const FormGrid = styled(Grid)(() => ({
// //   display: 'flex',
// //   flexDirection: 'column',
// //   gap: '4px',
// // }));

// // const TinyLabel = styled(FormLabel)(() => ({
// //   fontSize: '0.75rem',
// //   fontWeight: 700,
// //   color: '#7f8c8d',
// //   textTransform: 'uppercase',
// //   '& .MuiFormLabel-asterisk': {
// //     color: '#e74c3c'
// //   }
// // }));

// // const SectionTitle = styled(Typography)(({ theme }) => ({
// //   fontWeight: 800,
// //   fontSize: '0.9rem',
// //   marginBottom: theme.spacing(2),
// //   marginTop: theme.spacing(1),
// //   color: '#2C3E50',
// //   borderLeft: '4px solid #1abc9c',
// //   paddingLeft: '12px',
// //   textTransform: 'uppercase',
// //   letterSpacing: '1px'
// // }));

// // export default function IssueDiploma() {
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState('');
  
// //   // State UI Sukses
// //   const [isSuccess, setIsSuccess] = useState(false);
// //   const [deployedHash, setDeployedHash] = useState('');
  
// //   const [formData, setFormData] = useState({
// //     national_diploma_number: '',
// //     university_name: '', 
// //     university_id_code: '',
// //     higher_education_program: 'Bachelor (B.Sc.)',
// //     study_program_name: '',
// //     study_program_id: '',
// //     student_name: '',
// //     student_id: '',
// //     place_of_birth: '',
// //     date_of_birth: null, 
// //     academic_degree: '',
// //     gpa: '',
// //     graduation_date: null, 
// //     issuance_location: '',
// //     issuance_date: null, 
// //     signatory_name: 'Prof. Dr. Hasan Mahmud',
// //     signatory_title: 'Rector',
// //     id_issuer: '' 
// //   });

// //   // Sinkronisasi otomatis dengan sesi Login
// //   useEffect(() => {
// //     const savedIssuerId = localStorage.getItem('veda_issuer_id');
// //     const savedUnivName = localStorage.getItem('veda_university_name');
    
// //     if (savedIssuerId) {
// //       setFormData(prevData => ({
// //         ...prevData,
// //         id_issuer: parseInt(savedIssuerId)
// //         ,
// //         university_name: savedUnivName || 'International Burch University'
// //       }));
// //     }
// //   }, []);

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleDateChange = (name, newValue) => {
// //     setFormData({ 
// //       ...formData, 
// //       [name]: newValue ? newValue.format('YYYY-MM-DD') : '' 
// //     });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setStatus('Preparing payload for Blockchain...');
// //     setIsSuccess(false);
    
// //     try {
// //       // 1. Kirim data ke Backend
// //       const prepareResponse = await prepareDiploma(formData);
// //       const responseData = prepareResponse.data ? prepareResponse.data : prepareResponse;
      
// //       if (!responseData.blockchain_payload) throw new Error("Failed to get response from Backend.");
      
// //       const diploma_hash = responseData.blockchain_payload.diploma_hash;
// //       const required_wallet = responseData.blockchain_payload.wallet_address; 
      
// //       // 2. Siapkan ABI (Menggunakan bytes32)
// //       const contractABI = [
// //           "function storeDiplomaHash(bytes32 diplomaHash, string universityId, string studentId) public"
// //       ];

// //       // 3. Eksekusi Web3
// //       setStatus('Waiting for MetaMask Confirmation...');
// //       await issueDiplomaOnChain(
// //           "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268", // Alamat Contract Veda
// //           contractABI,
// //           diploma_hash,
// //           formData.university_id_code,
// //           formData.student_id,
// //           required_wallet
// //       );
      
// //       // 4. Sukses: Generate QR Code
// //       setStatus('Generating QR Code...');
// //       const qrUrl = `https://veda-verify.com/verify/${diploma_hash}`;
// //       const qrDataUrl = await QRCode.toDataURL(qrUrl);
// //       const link = document.createElement('a');
// //       link.href = qrDataUrl;
// //       link.download = `Diploma_${formData.student_name}.png`;
// //       link.click();

// //       // 5. Ubah Tampilan UI ke Sukses
// //       setIsSuccess(true);
// //       setDeployedHash(diploma_hash);
// //       setStatus('');

// //     } catch (error) {
// //       console.error("Error Detail:", error);
// //       setStatus(`Error: ${error.message}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDayjs}>
// //       <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 1 }}>
// //         <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fff' }}>
          
// //           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
// //               <Typography variant="h5" sx={{ fontWeight: 800, color: '#34495e', m: 0 }}>
// //                 DIPLOMA ISSUANCE PORTAL
// //               </Typography>
// //               <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
// //                   Securely mint new academic credentials to the blockchain.
// //               </Typography>
// //           </Box>

// //           {/* Form hanya ditampilkan jika belum sukses menerbitkan ijazah */}
// //           {!isSuccess && (
// //             <>
// //               {/* SECTION 1: INSTITUTION */}
// //               <SectionTitle>Institution Info</SectionTitle>
// //               <Grid container spacing={3}>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>National Diploma No.</TinyLabel>
// //                   <OutlinedInput name="national_diploma_number" size="small" required value={formData.national_diploma_number} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>University Name</TinyLabel>
// //                   <OutlinedInput name="university_name" size="small" required value={formData.university_name} onChange={handleChange} disabled/></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>University ID Code</TinyLabel>
// //                   <OutlinedInput name="university_id_code" size="small" required value={formData.university_id_code} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Higher Ed Program</TinyLabel>
// //                   <OutlinedInput name="higher_education_program" size="small" required value={formData.higher_education_program} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Study Program Name</TinyLabel>
// //                   <OutlinedInput name="study_program_name" size="small" required value={formData.study_program_name} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Study Program ID</TinyLabel>
// //                   <OutlinedInput name="study_program_id" size="small" required value={formData.study_program_id} onChange={handleChange} /></FormGrid>
// //               </Grid>

// //               <Divider sx={{ my: 4 }} />

// //               {/* SECTION 2: GRADUATE */}
// //               <SectionTitle>Graduate Info</SectionTitle>
// //               <Grid container spacing={3}>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Full Name</TinyLabel>
// //                   <OutlinedInput name="student_name" size="small" required value={formData.student_name} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Student ID (NIM)</TinyLabel>
// //                   <OutlinedInput name="student_id" size="small" required value={formData.student_id} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Academic Degree</TinyLabel>
// //                   <OutlinedInput name="academic_degree" size="small" required value={formData.academic_degree} onChange={handleChange} /></FormGrid>
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Place of Birth</TinyLabel>
// //                   <OutlinedInput name="place_of_birth" size="small" required value={formData.place_of_birth} onChange={handleChange} /></FormGrid>
                
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Date of Birth</TinyLabel>
// //                   <DatePicker 
// //                     format="DD/MM/YYYY"
// //                     value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
// //                     onChange={(newValue) => handleDateChange('date_of_birth', newValue)}
// //                     slotProps={{ textField: { size: 'small', required: true } }}
// //                   />
// //                 </FormGrid>
                
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>GPA</TinyLabel>
// //                   <OutlinedInput name="gpa" size="small" required placeholder="3.90" value={formData.gpa} onChange={handleChange} /></FormGrid>
                
// //                 <FormGrid item xs={12} md={6} lg={4}><TinyLabel required>Graduation Date</TinyLabel>
// //                   <DatePicker 
// //                     format="DD/MM/YYYY"
// //                     value={formData.graduation_date ? dayjs(formData.graduation_date) : null}
// //                     onChange={(newValue) => handleDateChange('graduation_date', newValue)}
// //                     slotProps={{ textField: { size: 'small', required: true } }}
// //                   />
// //                 </FormGrid>
// //               </Grid>

// //               <Divider sx={{ my: 4 }} />

// //               {/* SECTION 3: AUTHORIZATION */}
// //               <SectionTitle>Authorization</SectionTitle>
// //               <Grid container spacing={3} sx={{ mb: 5 }}>
// //                 <FormGrid item xs={12} md={6}><TinyLabel required>Issuance Location</TinyLabel>
// //                   <OutlinedInput name="issuance_location" size="small" required value={formData.issuance_location} onChange={handleChange} /></FormGrid>
                
// //                 <FormGrid item xs={12} md={6}><TinyLabel required>Issuance Date</TinyLabel>
// //                   <DatePicker 
// //                     format="DD/MM/YYYY"
// //                     value={formData.issuance_date ? dayjs(formData.issuance_date) : null}
// //                     onChange={(newValue) => handleDateChange('issuance_date', newValue)}
// //                     slotProps={{ textField: { size: 'small', required: true } }}
// //                   />
// //                 </FormGrid>
                
// //                 <FormGrid item xs={12} md={6}><TinyLabel required>Signatory Name</TinyLabel>
// //                   <OutlinedInput name="signatory_name" size="small" required value={formData.signatory_name} onChange={handleChange} /></FormGrid>
                
// //                 <FormGrid item xs={12} md={6}><TinyLabel required>Signatory Title</TinyLabel>
// //                   <OutlinedInput name="signatory_title" size="small" required value={formData.signatory_title} onChange={handleChange} /></FormGrid>
// //               </Grid>

// //               <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
// //                   <Button 
// //                   type="submit" 
// //                   variant="contained" 
// //                   disabled={loading}
// //                   sx={{ 
// //                       py: 1.5, px: 5,
// //                       backgroundColor: '#1abc9c', 
// //                       '&:hover': { backgroundColor: '#16a085' },
// //                       fontWeight: 800, fontSize: '0.85rem',
// //                       borderRadius: '8px', minWidth: '250px'
// //                   }}
// //                   >
// //                   {loading ? <CircularProgress size={20} color="inherit" /> : 'SECURE & DEPLOY DIPLOMA'}
// //                   </Button>
// //               </Box>
// //             </>
// //           )}

// //           {/* STATUS TEKS ERROR / PENDING (Hanya muncul jika isSuccess = false) */}
// //           {status && !isSuccess && (
// //             <Typography variant="subtitle2" sx={{ 
// //               mt: 3, display: 'block', textAlign: 'right', 
// //               color: status.includes('Error') ? '#e74c3c' : '#f39c12', 
// //               fontWeight: 700
// //             }}>
// //               {status}
// //             </Typography>
// //           )}

// //           {/* KOTAK SUKSES (Muncul setelah MetaMask Selesai) */}
// //           {isSuccess && (
// //             <Box sx={{ mt: 2, p: 4, backgroundColor: '#f0fbf8', borderRadius: 2, border: '2px dashed #1abc9c' }}>
// //               <Typography variant="h5" sx={{ color: '#1abc9c', fontWeight: 900, mb: 1, textAlign: 'center' }}>
// //                 🚀 DIPLOMA SUCCESSFULLY SECURED ON BLOCKCHAIN
// //               </Typography>
// //               <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3, textAlign: 'center', wordBreak: 'break-all' }}>
// //                 Transaction Hash: <strong style={{ color: '#34495e' }}>{deployedHash}</strong>
// //               </Typography>
// //               <Divider sx={{ mb: 3, borderColor: '#1abc9c', opacity: 0.2 }} />
              
// //               <Grid container spacing={3}>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Full Name</Typography><Typography fontWeight="700">{formData.student_name}</Typography></Grid>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Student ID (NIM)</Typography><Typography fontWeight="700">{formData.student_id}</Typography></Grid>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">University</Typography><Typography fontWeight="700">{formData.university_name}</Typography></Grid>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Degree</Typography><Typography fontWeight="700">{formData.academic_degree}</Typography></Grid>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Study Program</Typography><Typography fontWeight="700">{formData.study_program_name}</Typography></Grid>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">GPA</Typography><Typography fontWeight="700">{formData.gpa}</Typography></Grid>
// //                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Issuance Date</Typography><Typography fontWeight="700">{formData.issuance_date ? dayjs(formData.issuance_date).format('DD/MM/YYYY') : ''}</Typography></Grid>
// //               </Grid>

// //               <Box sx={{ mt: 4, textAlign: 'center' }}>
// //                   <Button 
// //                     variant="outlined" 
// //                     onClick={() => {
// //                         setIsSuccess(false); 
// //                         setDeployedHash('');
// //                         // Mengosongkan data mahasiswa, mempertahankan data universitas
// //                         setFormData({
// //                           ...formData, 
// //                           student_name: '', 
// //                           student_id: '', 
// //                           national_diploma_number: '',
// //                           gpa: ''
// //                         }); 
// //                     }}
// //                     sx={{ color: '#1abc9c', borderColor: '#1abc9c', fontWeight: 800, px: 4 }}
// //                   >
// //                     ISSUE ANOTHER DIPLOMA
// //                   </Button>
// //               </Box>
// //             </Box>
// //           )}

// //         </Paper>
// //       </Box>
// //     </LocalizationProvider>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import { 
//   Grid, OutlinedInput, FormLabel, Typography, Button, 
//   Box, Paper, Divider, CircularProgress, MenuItem, Select
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import QRCode from 'qrcode';
// import { issueDiplomaOnChain } from '../services/web3';
// import { prepareDiploma } from '../services/api';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';

// const FormGrid = styled(Grid)(() => ({
//   display: 'flex',
//   flexDirection: 'column',
//   gap: '4px',
// }));

// const TinyLabel = styled(FormLabel)(() => ({
//   fontSize: '0.75rem',
//   fontWeight: 700,
//   color: '#7f8c8d',
//   textTransform: 'uppercase',
//   '& .MuiFormLabel-asterisk': { color: '#e74c3c' }
// }));

// const SectionTitle = styled(Typography)(({ theme }) => ({
//   fontWeight: 800,
//   fontSize: '0.9rem',
//   marginBottom: theme.spacing(2),
//   marginTop: theme.spacing(1),
//   color: '#2C3E50',
//   borderLeft: '4px solid #1abc9c',
//   paddingLeft: '12px',
//   textTransform: 'uppercase',
//   letterSpacing: '1px'
// }));

// // Opsi untuk Dropdown
// const programOptions = [
//     { 
//       label: "Bachelor Degree (S1)", 
//       value: "Bachelor Degree", 
//       degrees: [
//         "BA – Bachelor of Arts", "BSc – Bachelor of Science", "BArch – Bachelor of Architecture", 
//         "BAS – Bachelor of Applied Studies", "BB – Bachelor of Business", "BBA - Bachelor of Business Administration", 
//         "BBA (Hons) – Bachelor of Business Administration with Honours", "BCom – Bachelor of Commerce", 
//         "BCA – Bachelor of Computer Applications", "BD - Bachelor of Divinity", "BDes - Bachelor of Design", 
//         "BEd – Bachelor of Education", "BEng – Bachelor of Engineering", "BFin – Bachelor of Finance", 
//         "BFA - Bachelor of Fine Arts", "BIS – Bachelor of Information Systems", 
//         "BJMC – Bachelor of Journalism & Mass Communication", "LLB – Bachelor of Laws", 
//         "BLitt – Bachelor of Letters", "BSM – Bachelor in Management Studies", 
//         "BMath - Bachelor of Mathematics", "BMus - Bachelor of Music", "BN - Bachelor of Nursing", 
//         "BPharm - Bachelor of Pharmacy", "BPhil - Bachelor of Philosophy", "BPA - Bachelor of Public Administration", 
//         "BPA – Bachelor of Performing Arts", "BPH – Bachelor of Public Health", "BSW – Bachelor of Social Work", 
//         "BTech – Bachelor of Technology", "BTh – Bachelor of Theology", "MBBS – Bachelor of Medicine, Bachelor of Surgery"
//       ] 
//     },
//     { 
//       label: "Master Degree (S2)", 
//       value: "Master Degree", 
//       degrees: [
//         "MA: Master of Arts", "MS / MSc: Master of Science", "MPhil: Master of Philosophy", "MRes: Master of Research", "MSt: Master of Studies",
//         "MBA: Master of Business Administration", "EMBA: Executive Master of Business Administration", "MIM: Master in Management", 
//         "MFin: Master of Finance", "MAcc / MAcy: Master of Accountancy", "MPA: Master of Public Administration", 
//         "MPP: Master of Public Policy", "MRE: Master of Real Estate", "MIT / M.IT: Master of Information Technology", 
//         "MSIT: Master of Science in Information Technology", "MEng: Master of Engineering", "MCS: Master of Computer Science", 
//         "MDS: Master of Data Science", "MSDS: Master of Science in Data Science", "MFA: Master of Fine Arts", 
//         "MDes: Master of Design", "MMus / MM: Master of Music", "MArch: Master of Architecture", "MLA: Master of Landscape Architecture", 
//         "MPH: Master of Public Health", "MSN: Master of Science in Nursing", "MSW: Master of Social Work", "MHS: Master of Health Science", 
//         "M.Psy: Master of Psychology", "MEd / EdM: Master of Education", "MAT: Master of Arts in Teaching", "LLM: Master of Laws", "MLS: Master of Legal Studies"
//       ] 
//     },
//     { 
//       label: "Doctoral Degree (S3)", 
//       value: "Doctoral Degree", 
//       degrees: ["Ph.D. - Doctor of Philosophy"] 
//     }
// ];

// export default function IssueDiploma() {
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState('');
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [deployedHash, setDeployedHash] = useState('');
  
//   const [formData, setFormData] = useState({
//     national_diploma_number: '',
//     university_name: '', 
//     university_id_code: '',
//     higher_education_program: '',
//     study_program_name: '',
//     study_program_id: '',
//     student_name: '',
//     student_id: '',
//     place_of_birth: '',
//     date_of_birth: null, 
//     academic_degree: '',
//     gpa: '',
//     graduation_date: null, 
//     issuance_location: '',
//     issuance_date: null, 
//     signatory_name: 'Prof. Dr. Hasan Mahmud',
//     signatory_title: 'Rector',
//     id_issuer: '' 
//   });

//   useEffect(() => {
//     const savedIssuerId = localStorage.getItem('veda_issuer_id');
//     const savedUnivName = localStorage.getItem('veda_university_name');
//     if (savedIssuerId) {
//       setFormData(prevData => ({
//         ...prevData,
//         id_issuer: parseInt(savedIssuerId),
//         university_name: savedUnivName || '' // Kosongkan jika tidak ada di storage agar bisa diisi manual
//       }));
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleDateChange = (name, newValue) => {
//     setFormData(prev => ({ ...prev, [name]: newValue ? newValue.format('YYYY-MM-DD') : '' }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setStatus('Preparing payload for Blockchain...');
//     setIsSuccess(false);
//     try {
//       const prepareResponse = await prepareDiploma(formData);
//       const responseData = prepareResponse.data ? prepareResponse.data : prepareResponse;
//       if (!responseData.blockchain_payload) throw new Error("Failed to get response from Backend.");
      
//       const diploma_hash = responseData.blockchain_payload.diploma_hash;
//       const required_wallet = responseData.blockchain_payload.wallet_address; 
      
//       const contractABI = ["function storeDiplomaHash(bytes32 diplomaHash, string universityId, string studentId) public"];

//       setStatus('Waiting for MetaMask Confirmation...');
//       await issueDiplomaOnChain(
//           "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268", 
//           contractABI,
//           diploma_hash,
//           formData.university_id_code,
//           formData.student_id,
//           required_wallet
//       );
      
//       setStatus('Generating QR Code...');
//       const qrUrl = `https://veda-verify.com/verify/${diploma_hash}`;
//       const qrDataUrl = await QRCode.toDataURL(qrUrl);
//       const link = document.createElement('a');
//       link.href = qrDataUrl;
//       link.download = `Diploma_${formData.student_name}.png`;
//       link.click();

//       setIsSuccess(true);
//       setDeployedHash(diploma_hash);
//       setStatus('');
//     } catch (error) {
//       console.error("Error Detail:", error);
//       setStatus(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 1 }}>
//         <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fff' }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
//               <Typography variant="h5" sx={{ fontWeight: 800, color: '#34495e', m: 0 }}>
//                 DIPLOMA ISSUANCE PORTAL
//               </Typography>
//           </Box>

//           {!isSuccess && (
//             <>
//               <SectionTitle>Institution Info</SectionTitle>
//               <Grid container spacing={3}>
//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>National Diploma No.</TinyLabel>
//                   <OutlinedInput name="national_diploma_number" size="small" required value={formData.national_diploma_number} onChange={handleChange} />
//                 </FormGrid>
                
//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>University Name</TinyLabel>
//                   {/* Atribut 'disabled' dihapus agar bisa diedit manual */}
//                   <OutlinedInput name="university_name" size="small" required value={formData.university_name} onChange={handleChange} />
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>University ID Code</TinyLabel>
//                   <OutlinedInput name="university_id_code" size="small" required value={formData.university_id_code} onChange={handleChange} />
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Higher Ed Program</TinyLabel>
//                   <Select
//                     name="higher_education_program"
//                     value={formData.higher_education_program}
//                     onChange={handleChange}
//                     size="small"
//                     required
//                     displayEmpty
//                   >
//                     <MenuItem value="" disabled>Select Program</MenuItem>
//                     {programOptions.map((opt) => (
//                         <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
//                     ))}
//                   </Select>
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Study Program Name</TinyLabel>
//                   <OutlinedInput name="study_program_name" size="small" required value={formData.study_program_name} onChange={handleChange} />
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Study Program ID</TinyLabel>
//                   <OutlinedInput name="study_program_id" size="small" required value={formData.study_program_id} onChange={handleChange} />
//                 </FormGrid>
//               </Grid>

//               <Divider sx={{ my: 4 }} />

//               <SectionTitle>Graduate Info</SectionTitle>
//               <Grid container spacing={3}>
//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Full Name</TinyLabel>
//                   <OutlinedInput name="student_name" size="small" required value={formData.student_name} onChange={handleChange} />
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Student ID (NIM)</TinyLabel>
//                   <OutlinedInput name="student_id" size="small" required value={formData.student_id} onChange={handleChange} />
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Academic Degree</TinyLabel>
//                   <Select
//                     name="academic_degree"
//                     value={formData.academic_degree}
//                     onChange={handleChange}
//                     size="small"
//                     required
//                     displayEmpty
//                   >
//                     <MenuItem value="" disabled>Select Degree</MenuItem>
//                     {/* Dropdown dinamis berdasarkan Higher Ed Program yang dipilih */}
//                     {programOptions.find(p => p.value === formData.higher_education_program)?.degrees.map(d => (
//                         <MenuItem key={d} value={d}>{d}</MenuItem>
//                     )) || <MenuItem disabled>Select program first</MenuItem>}
//                   </Select>
//                 </FormGrid>

//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Place of Birth</TinyLabel>
//                   <OutlinedInput name="place_of_birth" size="small" required value={formData.place_of_birth} onChange={handleChange} />
//                 </FormGrid>
                
//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Date of Birth</TinyLabel>
//                   <DatePicker 
//                     format="DD/MM/YYYY"
//                     value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
//                     onChange={(newValue) => handleDateChange('date_of_birth', newValue)}
//                     slotProps={{ textField: { size: 'small', required: true } }}
//                   />
//                 </FormGrid>
                
//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>GPA</TinyLabel>
//                   <OutlinedInput name="gpa" size="small" required placeholder="3.90" value={formData.gpa} onChange={handleChange} />
//                 </FormGrid>
                
//                 <FormGrid item xs={12} md={6} lg={4}>
//                   <TinyLabel required>Graduation Date</TinyLabel>
//                   <DatePicker 
//                     format="DD/MM/YYYY"
//                     value={formData.graduation_date ? dayjs(formData.graduation_date) : null}
//                     onChange={(newValue) => handleDateChange('graduation_date', newValue)}
//                     slotProps={{ textField: { size: 'small', required: true } }}
//                   />
//                 </FormGrid>
//               </Grid>

//               <Divider sx={{ my: 4 }} />

//               <SectionTitle>Authorization</SectionTitle>
//               <Grid container spacing={3} sx={{ mb: 5 }}>
//                 <FormGrid item xs={12} md={6}>
//                   <TinyLabel required>Issuance Location</TinyLabel>
//                   <OutlinedInput name="issuance_location" size="small" required value={formData.issuance_location} onChange={handleChange} />
//                 </FormGrid>
//                 <FormGrid item xs={12} md={6}>
//                   <TinyLabel required>Issuance Date</TinyLabel>
//                   <DatePicker 
//                     format="DD/MM/YYYY"
//                     value={formData.issuance_date ? dayjs(formData.issuance_date) : null}
//                     onChange={(newValue) => handleDateChange('issuance_date', newValue)}
//                     slotProps={{ textField: { size: 'small', required: true } }}
//                   />
//                 </FormGrid>
//                 <FormGrid item xs={12} md={6}>
//                   <TinyLabel required>Signatory Name</TinyLabel>
//                   <OutlinedInput name="signatory_name" size="small" required value={formData.signatory_name} onChange={handleChange} />
//                 </FormGrid>
//                 <FormGrid item xs={12} md={6}>
//                   <TinyLabel required>Signatory Title</TinyLabel>
//                   <OutlinedInput name="signatory_title" size="small" required value={formData.signatory_title} onChange={handleChange} />
//                 </FormGrid>
//               </Grid>

//               <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
//                   <Button 
//                     type="submit" 
//                     variant="contained" 
//                     disabled={loading}
//                     sx={{ py: 1.5, px: 5, backgroundColor: '#1abc9c', '&:hover': { backgroundColor: '#16a085' }, fontWeight: 800, borderRadius: '8px', minWidth: '250px' }}
//                   >
//                   {loading ? <CircularProgress size={20} color="inherit" /> : 'SECURE & DEPLOY DIPLOMA'}
//                   </Button>
//               </Box>
//             </>
//           )}

//           {status && !isSuccess && (
//             <Typography variant="subtitle2" sx={{ mt: 3, display: 'block', textAlign: 'right', color: status.includes('Error') ? '#e74c3c' : '#f39c12', fontWeight: 700 }}>
//               {status}
//             </Typography>
//           )}

//           {isSuccess && (
//             <Box sx={{ mt: 2, p: 4, backgroundColor: '#f0fbf8', borderRadius: 2, border: '2px dashed #1abc9c' }}>
//               <Typography variant="h5" sx={{ color: '#1abc9c', fontWeight: 900, mb: 1, textAlign: 'center' }}>
//                 🚀 DIPLOMA SUCCESSFULLY SECURED ON BLOCKCHAIN
//               </Typography>
//               <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3, textAlign: 'center', wordBreak: 'break-all' }}>
//                 Transaction Hash: <strong style={{ color: '#34495e' }}>{deployedHash}</strong>
//               </Typography>
//               <Divider sx={{ mb: 3, borderColor: '#1abc9c', opacity: 0.2 }} />
//               <Grid container spacing={3}>
//                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Full Name</Typography><Typography fontWeight="700">{formData.student_name}</Typography></Grid>
//                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Student ID (NIM)</Typography><Typography fontWeight="700">{formData.student_id}</Typography></Grid>
//                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">University</Typography><Typography fontWeight="700">{formData.university_name}</Typography></Grid>
//                 <Grid item xs={6} md={3}><Typography variant="caption" color="textSecondary">Degree</Typography><Typography fontWeight="700">{formData.academic_degree}</Typography></Grid>
//               </Grid>
//               <Box sx={{ mt: 4, textAlign: 'center' }}>
//                   <Button variant="outlined" onClick={() => { setIsSuccess(false); setDeployedHash(''); setFormData({...formData, student_name: '', student_id: '', national_diploma_number: '', gpa: ''}); }} sx={{ color: '#1abc9c', borderColor: '#1abc9c', fontWeight: 800, px: 4 }}>
//                     ISSUE ANOTHER DIPLOMA
//                   </Button>
//               </Box>
//             </Box>
//           )}
//         </Paper>
//       </Box>
//     </LocalizationProvider>
//   );
// }

import React, { useState, useEffect } from 'react';
import { 
  Grid, OutlinedInput, FormLabel, Typography, Button, 
  Box, Paper, Divider, CircularProgress, MenuItem, Select
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QRCode from 'qrcode';
import { issueDiplomaOnChain } from '../services/web3';
import { prepareDiploma } from '../services/api';
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

// DATA DROPDOWN BERDASARKAN INPUT USER
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
      
      const contractABI = ["function storeDiplomaHash(bytes32 diplomaHash, string universityId, string studentId) public"];

      setStatus('Waiting for MetaMask Confirmation...');
      await issueDiplomaOnChain(
          "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268", 
          contractABI,
          diploma_hash,
          formData.university_id_code,
          formData.student_id,
          required_wallet
      );
      
      setStatus('Generating QR Code...');
      const qrUrl = `https://veda-verify.com/verify/${diploma_hash}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `Diploma_${formData.student_name}.png`;
      link.click();

      setIsSuccess(true);
      setDeployedHash(diploma_hash);
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