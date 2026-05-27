# VEDA (Verifiable Educational Diploma Authenticator)

VEDA is a diploma authentication platform that utilizes a **Hybrid Blockchain-SQL** architecture. This system combines the efficiency of relational databases (MySQL) for comprehensive data management with the immutability of Blockchain technology (Ethereum/Sepolia) to ensure the permanent integrity and authenticity of educational documents.

## Security Framework: Hybrid Blockchain-SQL

The VEDA System employs a dual-layer security approach to balance data accessibility and cryptographic integrity:
1.  **Blockchain Tier (Integrity):** All digital fingerprints of documents are stored as cryptographic hashes on the public Ethereum blockchain. This serves as the immutable *Single Source of Truth*, preventing any unauthorized tampering or forgery.
2.  **Database Tier (Management):** A local SQL database manages academic records, institutional credentials, and Role-Based Access Control (RBAC). This ensures high performance for search and analytics while maintaining a secure link to the blockchain for validation.

## Key Features

- **Hybrid Data Validation:** Dual-verification process matching local database records with blockchain hash proofs in real-time.
- **Encrypted Diploma Issuance:** SHA-256 hashing performed off-chain before the record is registered on the Smart Contract.
- **Institutional Management:** Centralized control for Super Admins to manage University/Issuer accounts.
- **Real-time Analytics:** Dashboard for tracking diploma issuance statistics and system health.
- **Multi-Role Security:** Secure access via Role-Based Access Control (RBAC) and Google OAuth integration.

## Technology Stack

- **Backend:** FastAPI (Python) with SQLAlchemy ORM.
- **Frontend:** React (Vite) with Web3.js for blockchain interaction.
- **Blockchain:** Solidity Smart Contracts deployed on the Sepolia Testnet.
- **Database:** MySQL.

## Documentation

- **[Setup Guide](setup.md):** Local installation and configuration instructions.
- **[Testing Report](LAPORAN_TESTING.md):** Detailed results of Unit, Integration, and E2E tests with **86%** code coverage.

## Testing

The project undergoes rigorous automated testing:
- **Backend:** 36 test cases using Pytest.
- **Frontend:** Unit & Integration testing via Vitest.
- **E2E:** Full functional flows using Playwright.
