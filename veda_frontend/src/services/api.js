import axios from 'axios';

// Axios base configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to every request automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('veda_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Sends diploma data to backend for hashing and database queuing.
 */
export const prepareDiploma = async (diplomaData) => {
    try {
        const response = await api.post('/diploma/prepare', diplomaData);
        return response.data;
    } catch (error) {
        console.error("API Error (Prepare):", error);
        throw new Error(
            error.response?.data?.detail || "Failed to connect to the university server."
        );
    }
};

/**
 * Updates the database record with the successful Blockchain Transaction Hash.
 */
export const confirmDiploma = async (recordId, txHash) => {
    try {
        const response = await api.patch(`/diploma/confirm/${recordId}?tx_hash=${txHash}`);
        return response.data;
    } catch (error) {
        console.error("API Error (Confirm):", error);
        throw new Error(
            error.response?.data?.detail || "Failed to sync blockchain data with the local database."
        );
    }
};

/**
 * Retrieves full student/diploma details from the database.
 */
export const getDiplomaDetails = async (diplomaHash) => {
    try {
        const response = await api.get(`/diploma/verify/${diplomaHash}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.detail || "Failed to retrieve student data from the university database."
        );
    }
};

export default api;
