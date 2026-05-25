import { describe, it, expect, vi, beforeEach } from 'vitest';
import { issueDiplomaOnChain } from '../../veda_frontend/src/services/web3';
import { ethers } from 'ethers';

// Mock ethers
vi.mock('ethers', () => {
    return {
        ethers: {
            BrowserProvider: vi.fn().mockImplementation(() => ({
                getSigner: vi.fn().mockResolvedValue({
                    getAddress: vi.fn().mockResolvedValue('0xConnectedWallet123')
                })
            })),
            Contract: vi.fn()
        }
    };
});

describe('Web3: issueDiplomaOnChain Guard Logic', () => {
    beforeEach(() => {
        // Setup mock window.ethereum
        vi.stubGlobal('window', { ethereum: {} });
    });

    it('should throw "Access Denied" error if the connected wallet does not match the registered university wallet', async () => {
        const fakeContractAddress = "0x123";
        const fakeABI = [];
        const fakeHash = "fakehash";
        const univId = "U1";
        const studentId = "S1";
        const requiredWallet = "0xDifferentRegisteredWallet456"; // Mismatch

        await expect(issueDiplomaOnChain(
            fakeContractAddress, fakeABI, fakeHash, univId, studentId, requiredWallet
        )).rejects.toThrow(/Access Denied/i);
    });

    it('should proceed if the wallets match (mocking success path)', async () => {
        const requiredWallet = "0xConnectedWallet123"; // Matches mock
        
        // Let's modify the Contract mock to return a tx
        ethers.Contract.mockImplementationOnce(() => ({
            storeDiplomaHash: vi.fn().mockResolvedValue({
                hash: '0xTxHash123',
                wait: vi.fn().mockResolvedValue({ status: 1 })
            })
        }));

        const result = await issueDiplomaOnChain(
            "0x123", [], "hash", "U1", "S1", requiredWallet
        );

        expect(result).toBe('0xTxHash123');
    });
});
