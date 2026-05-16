import axios from 'axios';

// Axios base configuration
// Ensure the port matches your FastAPI server (usually 8000)
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/diploma',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Sends diploma data to backend for hashing and database queuing.
 */
export const prepareDiploma = async (diplomaData) => {
    try {
        const response = await apiClient.post('/prepare', diplomaData);
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
        const response = await apiClient.patch(`/confirm/${recordId}?tx_hash=${txHash}`);
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
        const response = await apiClient.get(`/verify/${diplomaHash}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.detail || "Failed to retrieve student data from the university database."
        );
    }
};
