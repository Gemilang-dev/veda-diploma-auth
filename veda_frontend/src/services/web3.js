import { ethers } from 'ethers';

// 1. Check for MetaMask presence
export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install the MetaMask extension in your browser.");
    }
    return new ethers.BrowserProvider(window.ethereum);
};

// 2. Issuance: Submit hash to Smart Contract (Sepolia)
export const issueDiplomaOnChain = async (
    contractAddress, 
    contractABI, 
    diplomaHash, 
    universityId, 
    studentId,
    requiredWallet // The wallet that MUST be used
) => {
    try {
        const provider = getProvider();
        const signer = await provider.getSigner();
        const connectedWallet = await signer.getAddress();

        // Security Check: Ensure the user is using the wallet registered in our database
        if (connectedWallet.toLowerCase() !== requiredWallet.toLowerCase()) {
            throw new Error(`Access Denied! Your MetaMask account (${connectedWallet}) does not match the University record in our Database (${requiredWallet}).`);
        }

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Call the Smart Contract function
        const tx = await contract.storeDiplomaHash(diplomaHash, universityId, studentId);
        
        // Wait for 1 confirmation on the blockchain
        const receipt = await tx.wait();
        console.log("Blockchain Receipt:", receipt);

        return tx.hash; // Return the Transaction Hash for database syncing
        
    } catch (error) {
        console.error("Web3 Issuance Error:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaction was rejected by the user.");
        }
        throw new Error(error.message || "Failed to issue diploma on blockchain.");
    }
};

// 3. Verification: Read state from Smart Contract
export const verifyDiplomaOnChain = async (contractAddress, contractABI, diplomaHash) => {
    try {
        // For reading, we can use a public RPC provider (No MetaMask required for verification)
        // Alternative 1: https://ethereum-sepolia-rpc.publicnode.com
        // Alternative 2: https://1rpc.io/sepolia
        // Alternative 3: https://rpc2.sepolia.org
        const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        // Call verifyDiploma view function
        const result = await contract.verifyDiploma(diplomaHash);
        
        return {
            isValid: result[0],
            isRevoked: result[1],
            issuedAt: Number(result[2]) 
        };
    } catch (error) {
        console.error("Blockchain Verification Error:", error);
        throw new Error("Failed to connect to the blockchain or invalid hash format.");
    }
};
