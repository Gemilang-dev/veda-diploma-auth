# VEDA (Verifiable Educational Diploma Authenticator)

VEDA adalah platform autentikasi ijazah pendidikan berbasis Blockchain (Ethereum/Sepolia) dan Database SQL. Sistem ini menjamin integritas data ijazah melalui proses hashing SHA-256 dan validasi on-chain untuk mencegah pemalsuan.

## Fitur Utama

- **Penerbitan Ijazah Terenkripsi:** Hashing data ijazah secara off-chain dan registrasi bukti ke Blockchain.
- **Verifikasi Instan:** Verifikasi ijazah melalui QR Code dengan pencocokan data SQL dan Blockchain secara real-time.
- **Manajemen Institusi:** Pendaftaran dan pengelolaan akun Universitas/Issuer oleh Super Admin.
- **Analytics Dashboard:** Statistik penerbitan ijazah bagi institusi dan pantauan sistem bagi admin.
- **Multi-Role Security:** Keamanan berbasis Role-Based Access Control (RBAC) dan integrasi Google OAuth.

## Arsitektur Sistem

- **Backend:** FastAPI (Python) dengan SQLAlchemy ORM.
- **Frontend:** React (Vite) dengan Web3.js.
- **Blockchain:** Smart Contract (Solidity) pada jaringan Sepolia Testnet.
- **Database:** MySQL.

## Dokumentasi

- **[Setup Guide](setup.md):** Panduan instalasi dan menjalankan proyek di lingkungan lokal.
- **[Laporan Pengujian](LAPORAN_TESTING.md):** Dokumentasi detail hasil pengujian Unit, Integrasi (API), dan End-to-End (E2E) dengan cakupan kode mencapai **86%**.

## Pengujian

Proyek ini telah melalui pengujian otomatis yang komprehensif:
- **Backend:** 36 test case menggunakan Pytest (Cakupan 86%).
- **Frontend:** Unit & Integration test menggunakan Vitest.
- **E2E:** Alur kerja lengkap dari Admin hingga Verifikator menggunakan Playwright.

Lihat [LAPORAN_TESTING.md](LAPORAN_TESTING.md) untuk rincian bukti eksekusi dan analisis dampak.
