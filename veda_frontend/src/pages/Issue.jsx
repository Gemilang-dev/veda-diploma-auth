import React, { useState } from 'react';
// Import fungsi "kurir" yang sudah kita buat
import { prepareDiploma, confirmDiploma } from '../services/api';
import { issueDiplomaOnChain } from '../services/web3';

const Issue = () => {
    // 1. State untuk menyimpan isian form
    const [formData, setFormData] = useState({
        diploma_number: 'DIP-2026-0002', // Default value untuk testing
        student_name: 'Budi Santoso',
        student_id: '19010002',
        gpa: '3.90',
        degree: 'Sarjana Komputer (S.Kom)',
        id_issuer: 3 // ID Kampus VEDA di database Anda
    });

    // 2. State untuk status UI (loading, error, success)
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [txHash, setTxHash] = useState('');

    // Fungsi untuk menangani ketikan user di form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fungsi Utama: Dieksekusi saat tombol "Terbitkan" diklik
    const handleSubmit = async (e) => {
        e.preventDefault(); // Mencegah halaman refresh
        setIsLoading(true);
        setIsError(false);
        setStatusMessage('Tahap 1: Menyiapkan data dan menghubungi Backend...');
        setTxHash('');

        // ⚠️ PENTING: Ganti dengan alamat Smart Contract Anda!
        const CONTRACT_ADDRESS = "0x6075Ab0B2868483092Bc7cE9a78cb7821D31a268"; 
        const CONTRACT_ABI = [ 
    "function storeDiplomaHash(bytes32 _diplomaHash, string _universityId, string _studentId) external" 
];

        try {
            // ==========================================
            // TAHAP 1: PREPARE (Menembak API Backend)
            // ==========================================
            const prepareResponse = await prepareDiploma(formData);
            const recordId = prepareResponse.database_info.record_id;
            const diplomaHash = prepareResponse.blockchain_payload.diploma_hash;
            const requiredWallet = prepareResponse.blockchain_payload.wallet_address;

            setStatusMessage('Tahap 2: Menunggu tanda tangan MetaMask...');

            // ==========================================
            // TAHAP 2: BLOCKCHAIN (Menjalankan MetaMask)
            // ==========================================
            const univId = String(formData.id_issuer); 
            const studentId = String(formData.student_id);

            const transactionHash = await issueDiplomaOnChain(
                CONTRACT_ADDRESS, 
                CONTRACT_ABI, 
                diplomaHash, 
                univId,       // Kirim ID Kampus (misal: 'This01')
                studentId,    // Kirim NIM (misal: '19010002')
                requiredWallet
            );

            setStatusMessage('Tahap 3: Mengonfirmasi resi transaksi ke Database...');

            // ==========================================
            // TAHAP 3: CONFIRM (Update status di Backend)
            // ==========================================
            await confirmDiploma(recordId, transactionHash);

            // ==========================================
            // TAHAP 4: SUKSES UI
            // ==========================================
            setStatusMessage('🎉 BERHASIL! Ijazah telah permanen di Blockchain!');
            setTxHash(transactionHash);
            
        } catch (error) {
            console.error(error);
            setIsError(true);
            setStatusMessage(`❌ GAGAL: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <div style={{ padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: '#fff' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>Penerbitan Ijazah VEDA</h2>
                <hr style={{ marginBottom: '20px' }}/>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label><strong>Nomor Ijazah:</strong></label>
                        <input type="text" name="diploma_number" value={formData.diploma_number} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div>
                        <label><strong>Nama Mahasiswa:</strong></label>
                        <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label><strong>NIM:</strong></label>
                            <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label><strong>IPK:</strong></label>
                            <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label><strong>Gelar:</strong></label>
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
                        {isLoading ? 'Memproses...' : 'Terbitkan dengan MetaMask'}
                    </button>
                </form>

                {/* AREA STATUS & LOG */}
                {statusMessage && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: isError ? '#ffe6e6' : '#e6ffe6', color: isError ? '#cc0000' : '#006600', border: `1px solid ${isError ? '#cc0000' : '#006600'}` }}>
                        <strong>Status:</strong> {statusMessage}
                        {txHash && (
                            <div style={{ marginTop: '10px', fontSize: '12px', wordBreak: 'break-all' }}>
                                <strong>Tx Hash:</strong> {txHash}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// CSS dasar untuk input agar rapi
const inputStyle = {
    width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box'
};

export default Issue;

const downloadQRCode = (diplomaNumber) => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${diplomaNumber}.png`; // Nama file otomatis
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};