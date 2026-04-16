import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyDiplomaOnChain } from '../services/web3';
import { getDiplomaDetails } from '../services/api'; // <--- Import the new API function

const Verify = () => {
    const [scannedHash, setScannedHash] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('idle'); 
    const [blockchainData, setBlockchainData] = useState(null);
    const [offChainData, setOffChainData] = useState(null); // State for MySQL data
    const [errorMessage, setErrorMessage] = useState('');

    const [qrRegionId] = useState(`qr-reader-${Math.floor(Math.random() * 1000000)}`);

    const CONTRACT_ADDRESS = "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268"; 
    const CONTRACT_ABI = [
        "function verifyDiploma(bytes32 _diplomaHash) external view returns (bool isValid, bool isRevoked, uint256 issuedAt)"
    ];

    useEffect(() => {
        let scanner = null;
        let timeoutId = null;

        if (verificationStatus === 'idle') {
            timeoutId = setTimeout(() => {
                scanner = new Html5QrcodeScanner(
                    qrRegionId,
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );

                const onScanSuccess = (decodedText) => {
                    if (scanner) {
                        scanner.clear().catch(error => console.error("Scanner clear error:", error));
                    }
                    const extractedHash = decodedText.split('/').pop();
                    setScannedHash(extractedHash);
                    handleVerification(extractedHash);
                };

                scanner.render(onScanSuccess, () => {});
            }, 50);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (scanner) {
                scanner.clear().catch(error => {
                    const videoElements = document.querySelectorAll('video');
                    videoElements.forEach(video => {
                        if (video.srcObject) video.srcObject.getTracks().forEach(track => track.stop());
                    });
                });
            }
        };
    }, [verificationStatus, qrRegionId]);

    // CORE VERIFICATION LOGIC: Hybrid Approach (Blockchain + MySQL)
    const handleVerification = async (hashToVerify) => {
        setVerificationStatus('loading');
        setErrorMessage('');
        setBlockchainData(null);
        setOffChainData(null);

        if (!hashToVerify.startsWith('0x') || hashToVerify.length !== 66) {
            setVerificationStatus('invalid');
            setErrorMessage('Invalid cryptographic hash format detected.');
            return;
        }

        try {
            // 1. Verify On-Chain (Blockchain Anchor)
            const onChainResult = await verifyDiplomaOnChain(CONTRACT_ADDRESS, CONTRACT_ABI, hashToVerify);

            if (onChainResult.isValid) {
                if (onChainResult.isRevoked) {
                    setVerificationStatus('revoked');
                } else {
                    // 2. Fetch Off-Chain Data (MySQL) if Blockchain says it's valid
                    try {
                        const dbResult = await getDiplomaDetails(hashToVerify);
                        setOffChainData(dbResult.data);
                        
                        const issueDate = new Date(onChainResult.issuedAt * 1000).toLocaleString('en-US', {
                            dateStyle: 'long', timeStyle: 'medium'
                        });
                        setBlockchainData({ date: issueDate });
                        setVerificationStatus('valid');
                        
                    } catch (dbError) {
                        setVerificationStatus('invalid');
                        setErrorMessage("Blockchain verified, but clear-text data is missing or corrupted in the university database.");
                    }
                }
            } else {
                setVerificationStatus('invalid');
                setErrorMessage("This cryptographic signature does not exist on the Sepolia Blockchain.");
            }
        } catch (error) {
            setVerificationStatus('invalid');
            setErrorMessage(error.message);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (scannedHash) handleVerification(scannedHash);
    };

    const handleScanAnother = () => {
        setScannedHash('');
        setErrorMessage('');
        setBlockchainData(null);
        setOffChainData(null);
        setVerificationStatus('idle'); 
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>Employer Verification Portal</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                    Verify the authenticity of academic credentials using Ethereum Web3 technology.
                </p>
                <hr style={{ marginBottom: '20px' }}/>

                {/* IDLE / SCANNING UI */}
                {verificationStatus === 'idle' && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <div id={qrRegionId} style={{ width: '100%', border: 'none', borderRadius: '8px', overflow: 'hidden' }}></div>
                        </div>
                        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Or manually enter the Hash ID..." value={scannedHash} onChange={(e) => setScannedHash(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Verify</button>
                        </form>
                    </>
                )}

                {/* LOADING UI */}
                {verificationStatus === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3 style={{ color: '#F6851B' }}>⏳ Executing Hybrid Verification...</h3>
                        <p style={{ color: '#666' }}>Cross-referencing university database with immutable blockchain records...</p>
                    </div>
                )}

                {/* RESULT UI */}
                {verificationStatus !== 'idle' && verificationStatus !== 'loading' && (
                    <div style={{ marginTop: '20px' }}>
                        
                        {/* 1. VALID RESULT (The Digital Profile Card) */}
                        {verificationStatus === 'valid' && offChainData && (
                            <div style={{ border: '2px solid #00b300', borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ backgroundColor: '#e6ffe6', padding: '20px', textAlign: 'center', borderBottom: '1px solid #00b300' }}>
                                    <h1 style={{ color: '#00b300', margin: '0 0 10px 0', fontSize: '32px' }}>✅ AUTHENTIC RECORD</h1>
                                    <p style={{ color: '#006600', margin: '0', fontSize: '14px' }}>Secured by Ethereum Sepolia Network</p>
                                </div>
                                
                                {/* Body: Student Profile */}
                                <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '5px' }}>Graduate Profile</h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <DataField label="Full Name" value={offChainData.student_name} />
                                        <DataField label="Student ID (NIM)" value={offChainData.student_id} />
                                        <DataField label="Academic Degree" value={offChainData.academic_degree} highlight />
                                        <DataField label="Cumulative GPA" value={offChainData.gpa} highlight />
                                        <DataField label="Study Program" value={offChainData.study_program_name} />
                                        <DataField label="Graduation Date" value={offChainData.graduation_date} />
                                    </div>

                                    <h3 style={{ margin: '25px 0 15px 0', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '5px' }}>Institution & Cryptography</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <DataField label="University" value={offChainData.university_name} />
                                        <DataField label="National Diploma No." value={offChainData.national_diploma_number} />
                                        
                                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Immutable Blockchain Signature (Hash):</p>
                                            <p style={{ margin: '0', fontSize: '11px', color: '#333', wordBreak: 'break-all', fontFamily: 'monospace' }}>{scannedHash}</p>
                                        </div>
                                        <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Smart Contract Timestamp:</p>
                                            <p style={{ margin: '0', fontSize: '12px', color: '#333' }}>{blockchainData?.date}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. INVALID RESULT */}
                        {verificationStatus === 'invalid' && (
                            <div style={{ padding: '20px', backgroundColor: '#ffe6e6', border: '2px solid #cc0000', borderRadius: '8px', textAlign: 'center' }}>
                                <h1 style={{ color: '#cc0000', margin: '0 0 10px 0', fontSize: '32px' }}>❌ VERIFICATION FAILED</h1>
                                <p style={{ color: '#333', marginTop: '15px' }}>The document is either counterfeit, unregistered, or the data has been illegally manipulated.</p>
                                {errorMessage && <p style={{ fontSize: '12px', color: '#cc0000', marginTop: '10px' }}>System Log: {errorMessage}</p>}
                            </div>
                        )}

                        {/* 3. REVOKED RESULT */}
                        {verificationStatus === 'revoked' && (
                            <div style={{ padding: '20px', backgroundColor: '#fff5e6', border: '2px solid #ff9900', borderRadius: '8px', textAlign: 'center' }}>
                                <h1 style={{ color: '#ff9900', margin: '0 0 10px 0', fontSize: '32px' }}>⚠️ RECORD REVOKED</h1>
                                <p style={{ color: '#333', marginTop: '15px' }}>This document was permanently voided by the issuing university.</p>
                            </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={handleScanAnother} style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Verify Another Document
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Component for rendering data rows cleanly
const DataField = ({ label, value, highlight }) => (
    <div style={{ backgroundColor: highlight ? '#fff4e6' : 'transparent', padding: highlight ? '8px' : '0', borderRadius: '4px' }}>
        <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '2px' }}>{label}</span>
        <span style={{ display: 'block', fontSize: '15px', fontWeight: highlight ? 'bold' : 'normal', color: highlight ? '#F6851B' : '#333' }}>{value || 'N/A'}</span>
    </div>
);

export default Verify;