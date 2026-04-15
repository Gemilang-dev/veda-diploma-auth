import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyDiplomaOnChain } from '../services/web3';

const Verify = () => {
    // 1. State Management
    const [scannedHash, setScannedHash] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('idle'); 
    const [diplomaData, setDiplomaData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Smart Contract Configuration
    const CONTRACT_ADDRESS = "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268"; 
    const CONTRACT_ABI = [
        "function verifyDiploma(bytes32 _diplomaHash) external view returns (bool isValid, bool isRevoked, uint256 issuedAt)"
    ];

    // 2. Flawless Scanner Initialization
    useEffect(() => {
        let scanner = null;
        let timeoutId = null;

        if (verificationStatus === 'idle') {
            // A tiny 50ms delay ensures React has fully painted the <div id="qr-reader"> 
            // onto the screen BEFORE the library tries to attach the camera to it.
            timeoutId = setTimeout(() => {
                scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );

                const onScanSuccess = (decodedText) => {
                    // Destroy the scanner immediately upon successful read
                    if (scanner) {
                        scanner.clear().catch(error => console.error("Scanner clear error:", error));
                    }
                    
                    const extractedHash = decodedText.split('/').pop();
                    setScannedHash(extractedHash);
                    handleVerification(extractedHash);
                };

                const onScanFailure = (error) => {
                    // Background errors while searching for QR are normal, ignore them.
                };

                scanner.render(onScanSuccess, onScanFailure);
            }, 50);
        }

        // Cleanup: Fires when moving to another tab or when status changes from 'idle'
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (scanner) {
                scanner.clear().catch(error => {
                    console.warn("Library cleanup interrupted. Engaging hardware kill-switch...", error);
                    // Forcefully disconnect webcam to prevent phantom cameras
                    const videoElements = document.querySelectorAll('video');
                    videoElements.forEach(video => {
                        if (video.srcObject) {
                            video.srcObject.getTracks().forEach(track => track.stop());
                        }
                    });
                });
            }
        };
    }, [verificationStatus]);

    // 3. Core Verification Logic
    const handleVerification = async (hashToVerify) => {
        setVerificationStatus('loading');
        setErrorMessage('');
        setDiplomaData(null);

        if (!hashToVerify.startsWith('0x') || hashToVerify.length !== 66) {
            setVerificationStatus('invalid');
            setErrorMessage('Invalid cryptographic hash format detected from the QR Code.');
            return;
        }

        try {
            const blockchainResult = await verifyDiplomaOnChain(
                CONTRACT_ADDRESS, 
                CONTRACT_ABI, 
                hashToVerify
            );

            if (blockchainResult.isValid) {
                if (blockchainResult.isRevoked) {
                    setVerificationStatus('revoked');
                } else {
                    setVerificationStatus('valid');
                    const issueDate = new Date(blockchainResult.issuedAt * 1000).toLocaleString('en-US', {
                        dateStyle: 'long',
                        timeStyle: 'medium'
                    });
                    setDiplomaData({ date: issueDate });
                }
            } else {
                setVerificationStatus('invalid');
            }
        } catch (error) {
            setVerificationStatus('invalid');
            setErrorMessage(error.message);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (scannedHash) {
            handleVerification(scannedHash);
        }
    };

    const handleScanAnother = () => {
        setScannedHash('');
        setErrorMessage('');
        setDiplomaData(null);
        setVerificationStatus('idle'); 
    };

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>Global Diploma Verification Portal</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                    Scan the QR code on the physical diploma or upload the digital QR image to verify its cryptographic authenticity.
                </p>
                <hr style={{ marginBottom: '20px' }}/>

                {/* UI Element: Static ID QR Scanner Area */}
                {verificationStatus === 'idle' && (
                    <div style={{ marginBottom: '20px' }}>
                        <div id="qr-reader" style={{ width: '100%', border: 'none', borderRadius: '8px', overflow: 'hidden' }}></div>
                    </div>
                )}

                {/* UI Element: Manual Fallback Input */}
                {verificationStatus === 'idle' && (
                    <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Or manually enter the 66-character Hash ID..." 
                            value={scannedHash}
                            onChange={(e) => setScannedHash(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Verify
                        </button>
                    </form>
                )}

                {/* UI Element: Loading State */}
                {verificationStatus === 'loading' && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3 style={{ color: '#F6851B' }}>⏳ Querying the Sepolia Blockchain...</h3>
                        <p style={{ color: '#666' }}>Cross-referencing the cryptographic signature...</p>
                    </div>
                )}

                {/* UI Element: Result States */}
                {verificationStatus !== 'idle' && verificationStatus !== 'loading' && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        
                        {/* VALID RESULT */}
                        {verificationStatus === 'valid' && (
                            <div style={{ padding: '20px', backgroundColor: '#e6ffe6', border: '2px solid #00b300', borderRadius: '8px' }}>
                                <h1 style={{ color: '#00b300', margin: '0 0 10px 0', fontSize: '40px' }}>✅ VERIFIED</h1>
                                <h3 style={{ color: '#006600', margin: '0' }}>Authentic Blockchain Record Found</h3>
                                <p style={{ color: '#333', marginTop: '15px' }}>
                                    This diploma is officially registered and secured on the Ethereum network.
                                </p>
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', display: 'inline-block', textAlign: 'left' }}>
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Cryptographic Hash:</strong> <br/><span style={{ fontSize: '12px', wordBreak: 'break-all', color: '#555' }}>{scannedHash}</span></p>
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Timestamp of Issuance:</strong> <br/><span style={{ fontSize: '14px', color: '#333' }}>{diplomaData?.date}</span></p>
                                </div>
                            </div>
                        )}

                        {/* INVALID RESULT */}
                        {verificationStatus === 'invalid' && (
                            <div style={{ padding: '20px', backgroundColor: '#ffe6e6', border: '2px solid #cc0000', borderRadius: '8px' }}>
                                <h1 style={{ color: '#cc0000', margin: '0 0 10px 0', fontSize: '40px' }}>❌ NOT FOUND</h1>
                                <h3 style={{ color: '#990000', margin: '0' }}>Unregistered or Counterfeit Document</h3>
                                <p style={{ color: '#333', marginTop: '15px' }}>
                                    No matching record exists on the blockchain. This document is invalid or forged.
                                </p>
                                {errorMessage && <p style={{ fontSize: '12px', color: '#cc0000', marginTop: '10px' }}>Log: {errorMessage}</p>}
                            </div>
                        )}

                        {/* REVOKED RESULT */}
                        {verificationStatus === 'revoked' && (
                            <div style={{ padding: '20px', backgroundColor: '#fff5e6', border: '2px solid #ff9900', borderRadius: '8px' }}>
                                <h1 style={{ color: '#ff9900', margin: '0 0 10px 0', fontSize: '40px' }}>⚠️ REVOKED</h1>
                                <h3 style={{ color: '#cc7a00', margin: '0' }}>Document Has Been Voided</h3>
                                <p style={{ color: '#333', marginTop: '15px' }}>
                                    This document was originally registered but has been permanently revoked by the issuing university.
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleScanAnother} 
                            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: '0.2s' }}
                        >
                            Scan Another Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Verify;