---
title: VEDA Backend API
emoji: 🔐
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# VEDA (Verifiable Educational Diploma Authenticator)

VEDA is a diploma authentication platform that utilizes a **Hybrid Blockchain-SQL** architecture. This system combines the efficiency of relational databases (MySQL) for comprehensive data management with the immutability of Blockchain technology (Ethereum/Sepolia) to ensure the permanent integrity and authenticity of educational documents.

## Security Framework: Hybrid Blockchain-SQL

The VEDA System employs a dual-layer security approach to balance data accessibility and cryptographic integrity:
1.  **Blockchain Tier (Integrity):** All digital fingerprints of documents are stored as cryptographic hashes on the public Ethereum blockchain. This serves as the immutable *Single Source of Truth*, preventing any unauthorized tampering or forgery.
2.  **Database Tier (Management):** A local SQL database manages academic records, institutional credentials, and Role-Based Access Control (RBAC). This ensures high performance for search and analytics while maintaining a secure link to the blockchain for validation.

## Deployment on Hugging Face Spaces

This repository is configured to be deployed as a Docker Space on Hugging Face.
- **Port:** 7860
- **Base Image:** python:3.11-slim
