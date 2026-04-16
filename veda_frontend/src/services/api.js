import axios from 'axios';

// Konfigurasi dasar Axios
// Sesuaikan port dengan FastAPI Anda (biasanya 8000)
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/diploma',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * TAHAP 1: Mengirim data form ke Backend untuk dibuatkan Hash dan masuk antrean (Pending)
 * @param {Object} diplomaData - { diploma_number, student_name, student_id, gpa, degree, id_issuer }
 * @returns {Object} Respons dari backend (berisi diploma_hash, dll)
 */
export const prepareDiploma = async (diplomaData) => {
    try {
        const response = await apiClient.post('/prepare', diplomaData);
        return response.data; // Mengembalikan data JSON dari FastAPI
    } catch (error) {
        // Tangkap pesan error spesifik dari FastAPI (seperti 400 Bad Request / 404 Not Found)
        if (error.response && error.response.data) {
            throw new Error(error.response.data.detail || "Gagal menyiapkan ijazah di server.");
        }
        throw new Error("Tidak dapat terhubung ke server Backend. Pastikan FastAPI menyala.");
    }
};

/**
 * TAHAP 2: Mengirim Transaction Hash dari Blockchain ke Backend untuk mengubah status (Success)
 * @param {number} recordId - ID rekaman di database MySQL (didapat dari tahap 1)
 * @param {string} txHash - Resi transaksi dari MetaMask
 * @returns {Object} Respons sukses dari backend
 */
export const confirmDiploma = async (recordId, txHash) => {
    try {
        // Endpoint PATCH kita menggunakan query parameter untuk tx_hash
        const response = await apiClient.patch(`/confirm/${recordId}?tx_hash=${txHash}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.detail || "Gagal mengonfirmasi transaksi di server.");
        }
        throw new Error("Gagal menghubungi server untuk konfirmasi.");
    }
};

// ==========================================
// NEW: FETCH OFF-CHAIN DATA FOR VERIFICATION
// ==========================================
export const getDiplomaDetails = async (diplomaHash) => {
    try {
        // This calls the GET /verify/{diploma_hash} route in your FastAPI backend
        const response = await apiClient.get(`/verify/${diplomaHash}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.detail || "Failed to retrieve student data from the university database."
        );
    }
};