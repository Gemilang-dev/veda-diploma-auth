import { ethers } from 'ethers';

// 1. Cek keberadaan MetaMask
export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error("MetaMask tidak terdeteksi. Silakan install ekstensi MetaMask di browser Anda.");
    }
    // Ethers v6 menggunakan BrowserProvider
    return new ethers.BrowserProvider(window.ethereum);
};

// 2. Fungsi untuk Login / Connect Wallet
export const connectWallet = async () => {
    try {
        const provider = getProvider();
        // Memunculkan pop-up MetaMask meminta izin akses
        const accounts = await provider.send("eth_requestAccounts", []);
        return accounts[0]; // Mengembalikan alamat dompet pertama yang dipilih (0x...)
    } catch (error) {
        console.error("Gagal menghubungkan MetaMask:", error);
        throw new Error("Gagal menghubungkan ke MetaMask. Pastikan Anda memberikan izin.");
    }
};

// 3. Fungsi Utama: Mengirim Hash ke Smart Contract (Blockchain)
export const issueDiplomaOnChain = async (contractAddress, contractABI, diplomaHash, universityId, studentId, requiredWallet) => {
    try {
        const provider = getProvider();
        const signer = await provider.getSigner();
        const connectedWallet = await signer.getAddress();

        if (connectedWallet.toLowerCase() !== requiredWallet.toLowerCase()) {
            throw new Error(`Akses Ditolak! Akun MetaMask Anda (${connectedWallet}) tidak cocok dengan data Kampus di Database (${requiredWallet}).`);
        }

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("Menunggu persetujuan MetaMask...");
        
        // UBAH NAMA FUNGSI DI SINI, DAN MASUKKAN 3 VARIABEL!
        const tx = await contract.storeDiplomaHash(diplomaHash, universityId, studentId);
        
        console.log(`Transaksi terkirim! Tx Hash: ${tx.hash}`);
        await tx.wait(); 
        
        return tx.hash;

    } catch (error) {
        console.error("Transaksi Blockchain Gagal:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaksi dibatalkan oleh pengguna.");
        }
        throw new Error(error.message || "Terjadi kesalahan saat memproses di Blockchain.");
    }
};