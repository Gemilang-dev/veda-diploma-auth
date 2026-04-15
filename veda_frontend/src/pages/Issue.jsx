import React, { useState } from 'react';
import { prepareDiploma, confirmDiploma } from '../services/api';
import { issueDiplomaOnChain } from '../services/web3';
import { QRCodeCanvas } from 'qrcode.react';

const Issue = () => {
    // 1. State to store form inputs
    const [formData, setFormData] = useState({
        diploma_number: 'DIP-2026-0002', // Default value for testing
        student_name: 'Budi Santoso',
        student_id: '19010002',
        gpa: '3.90',
        degree: 'Bachelor of Computer Science (S.Kom)',
        id_issuer: 3 // University ID in your database
    });

    // 2. State for UI status (loading, error, success)
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [txHash, setTxHash] = useState('');
    
    // NEW state to store QR Code URL
    const [verifyUrl, setVerifyUrl] = useState('');

    // Handle user input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // NEW function: automatically download QR Code
    const downloadQRCode = (diplomaNumber) => {
        const canvas = document.getElementById("qr-gen");
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${diplomaNumber}.png`; // Auto filename
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    // Main function: triggered when "Issue" button is clicked
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        setIsLoading(true);
        setIsError(false);
        setStatusMessage('Step 1: Preparing data and contacting Backend...');
        setTxHash('');
        setVerifyUrl(''); // Reset previous QR Code

        // ⚠️ IMPORTANT: Replace with your Smart Contract address!
        const CONTRACT_ADDRESS = "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268"; 
        const CONTRACT_ABI = [ 
            "function storeDiplomaHash(bytes32 _diplomaHash, string _universityId, string _studentId) external" 
        ];

        try {
            // ==========================================
            // STEP 1: PREPARE (Call Backend API)
            // ==========================================
            const prepareResponse = await prepareDiploma(formData);
            const recordId = prepareResponse.database_info.record_id;
            const diplomaHash = prepareResponse.blockchain_payload.diploma_hash;
            const requiredWallet = prepareResponse.blockchain_payload.wallet_address;

            setStatusMessage('Step 2: Waiting for MetaMask signature...');

            // ==========================================
            // STEP 2: BLOCKCHAIN (Trigger MetaMask)
            // ==========================================
            const univId = String(formData.id_issuer); 
            const studentId = String(formData.student_id);

            const transactionHash = await issueDiplomaOnChain(
                CONTRACT_ADDRESS, 
                CONTRACT_ABI, 
                diplomaHash, 
                univId,       
                studentId,    
                requiredWallet
            );

            setStatusMessage('Step 3: Confirming transaction receipt to Database...');

            // ==========================================
            // STEP 3: CONFIRM (Update Backend status)
            // ==========================================
            await confirmDiploma(recordId, transactionHash);

            // ==========================================
            // STEP 4: SUCCESS UI & GENERATE QR
            // ==========================================
            setStatusMessage('🎉 SUCCESS! Diploma is permanently stored on Blockchain!');
            setTxHash(transactionHash);
            
            // Create verification page URL
            const url = `${window.location.origin}/verify/${diplomaHash}`;
            setVerifyUrl(url);

            // Small delay to ensure QR is rendered before auto-download
            setTimeout(() => {
                downloadQRCode(formData.diploma_number);
            }, 500);

        } catch (error) {
            console.error(error);
            setIsError(true);
            setStatusMessage(`❌ FAILED: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>VEDA Diploma Issuance</h2>
                <hr style={{ marginBottom: '20px' }}/>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label><strong>Diploma Number:</strong></label>
                        <input type="text" name="diploma_number" value={formData.diploma_number} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label><strong>Student Name:</strong></label>
                        <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label><strong>Student ID:</strong></label>
                            <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label><strong>GPA:</strong></label>
                            <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label><strong>Degree:</strong></label>
                        <input type="text" name="degree" value={formData.degree} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={{
                            padding: '12px', marginTop: '10px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '5px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            backgroundColor: isLoading ? '#ccc' : '#F6851B', color: 'white'
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Issue with MetaMask'}
                    </button>
                </form>

                {/* STATUS & LOG AREA */}
                {statusMessage && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: isError ? '#ffe6e6' : '#e6ffe6', color: isError ? '#cc0000' : '#006600', border: `1px solid ${isError ? '#cc0000' : '#006600'}`, textAlign: 'center' }}>
                        <strong>Status:</strong> {statusMessage}
                        
                        {txHash && (
                            <div style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
                                <strong>Tx Hash:</strong> {txHash}
                            </div>
                        )}

                        {/* QR CODE DISPLAY IF SUCCESS */}
                        {verifyUrl && !isError && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    <QRCodeCanvas
                                        id="qr-gen"
                                        value={verifyUrl}
                                        size={150}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                                    File <strong>{formData.diploma_number}.png</strong> will be downloaded automatically.
                                </p>
                                <button 
                                    onClick={() => downloadQRCode(formData.diploma_number)}
                                    style={{ padding: '8px 15px', marginTop: '5px', backgroundColor: '#006600', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Download QR Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Basic CSS for clean input styling
const inputStyle = {
    width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box'
};

export default Issue;