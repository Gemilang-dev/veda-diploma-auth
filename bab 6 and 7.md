**BAB 6**
**MAINTENANCE ANALYSIS (ANALISIS PEMELIHARAAN)**

Analisis pemeliharaan (*maintenance analysis*) merupakan tahapan evaluasi yang krusial pasca-implementasi untuk memastikan bahwa sistem Veda Diploma Auth dapat beroperasi secara konsisten, aman, dan dapat diskalakan (*scalable*) dalam jangka panjang. Bab ini secara komprehensif menguraikan strategi pengelolaan arsitektur perangkat lunak, jaminan integritas data, mitigasi ancaman keamanan, prosedur pemulihan bencana (*disaster recovery*), serta peta jalan (*roadmap*) pengembangan sistem di masa depan.

### 6.1 System Maintainability (Kemudahan Pemeliharaan Sistem)
Pemeliharaan sistem berfokus pada kemudahan pengembang dalam melakukan modifikasi, perbaikan kutu (*bug fixing*), dan peningkatan fitur tanpa mengganggu stabilitas operasional. Veda Diploma Auth dirancang menggunakan paradigma arsitektur berorientasi layanan (*Service-Oriented Architecture*) dengan pendekatan modular:

*   **Pemeliharaan Sisi Server (Backend):** 
    Dibangun menggunakan bahasa pemrograman Python dengan *framework* FastAPI, *backend* dipisahkan secara terstruktur menjadi beberapa lapisan logis seperti *routes* (pengatur *endpoint* API), *models* (representasi skema basis data), dan *schemas* (validasi data menggunakan Pydantic). Struktur ini mengisolasi logika bisnis dari antarmuka komunikasi. Berikut adalah cuplikan kode inisialisasi aplikasi FastAPI yang mengintegrasikan berbagai modul tersebut:

    ```python
    # veda_backend/main.py
    from fastapi import FastAPI
    from veda_backend.routes import auth, issuer, diploma, analytics

    app = FastAPI(title="VEDA API", version="1.0.0")

    # Registrasi router untuk modularitas endpoint
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(issuer.router, prefix="/api/issuer", tags=["Issuer (University)"])
    app.include_router(diploma.router, prefix="/api/diploma", tags=["Diploma"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    ```
    **Figure 6.1** Inisialisasi Aplikasi FastAPI pada veda_backend/main.py

    Apabila di masa depan diperlukan perubahan pada algoritma *hashing* atau penambahan parameter pada kontrak pintar (*smart contract*), pengembang hanya perlu memodifikasi modul `blockchain_utils.py` tanpa merombak logika inti dari sistem API itu sendiri.
*   **Pemeliharaan Sisi Klien (Frontend):** 
    Antarmuka pengguna dikembangkan menggunakan pustaka React.js dengan pendekatan berbasis komponen (*component-based architecture*). Komponen-komponen UI seperti formulir pendaftaran, tabel manajemen pengguna, dan dasbor analitik bersifat *reusable* (dapat digunakan kembali). Berikut adalah contoh struktur komponen DashboardLayout yang menangani navigasi berbasis peran (*role-based access control*):

    ```jsx
    // veda_frontend/src/components/DashboardLayout.jsx
    export default function DashboardLayout({ role }) {
      const getMenus = () => {
        if (role === 'university') return [
          { title: 'Dashboard', path: '/university/dashboard' },
          { title: 'Issue Diploma', path: '/university/issue' },
          { title: 'Verify Document', path: '/university/verify' }
        ];
        if (role === 'admin') return [
          { title: 'Admin Dashboard', path: '/admin/dashboard' },
          { title: 'User Management', path: '/admin/users' }
        ];
        return [];
      };

      return (
        <Box sx={{ display: 'flex' }}>
          <Drawer variant="permanent" sx={{ width: 260 }}>
            <List>
              {getMenus().map((item) => (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton onClick={() => navigate(item.path)}>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Outlet />
          </Box>
        </Box>
      );
    }
    ```
    **Figure 6.2** Struktur Komponen DashboardLayout pada veda_frontend

    Hal ini memudahkan pemeliharaan visual; jika terdapat pembaruan panduan desain (*design guidelines*) atau perbaikan kerentanan pada sisi klien, perubahan cukup dilakukan pada satu komponen induk yang akan secara otomatis terefleksi ke seluruh aplikasi.
*   **Agnostik Basis Data melalui ORM:** 
    Sistem menggunakan SQLAlchemy sebagai *Object-Relational Mapping* (ORM) yang mendeklarasikan struktur tabel seperti tbl_admin dan tbl_issuer ke dalam bentuk kelas Python. Berikut adalah contoh deklarasi model data menggunakan SQLAlchemy:

    ```python
    # veda_backend/models.py
    class Issuer(Base):
        __tablename__ = "tbl_issuer"
        id_issuer = Column(Integer, primary_key=True, autoincrement=True)
        university_name = Column(String(150), nullable=False)
        email = Column(String(100), unique=True, nullable=False)
        wallet_address = Column(String(42), nullable=False)
        status = Column(Enum('Active', 'Inactive', name="issuer_status_enum"), default='Active')
    ```
    **Figure 6.3** Deklarasi Model Data Issuer Menggunakan SQLAlchemy ORM

    Pendekatan ini membuat lapisan aplikasi agnostik terhadap jenis *Database Management System* (DBMS) yang digunakan. Meskipun saat ini diimplementasikan menggunakan MySQL, proses migrasi ke sistem basis data lain seperti PostgreSQL atau MariaDB di masa depan dapat dilakukan dengan sangat mudah hanya dengan mengubah string koneksi pada database.py, tanpa perlu menulis ulang query SQL secara manual.

### 6.2 Data Integrity (Integritas Data)
Integritas data adalah pilar utama dalam sistem verifikasi ijazah digital ini. Veda Diploma Auth menerapkan konsep *Zero-Data Storage* pada penyimpanan *on-chain*, di mana data pribadi lulusan tidak pernah diunggah secara publik, melainkan melalui proses transformasi kriptografis:

*   **Standardisasi Hashing SHA-256:** 
    Sebelum ijazah dicatat ke dalam *blockchain*, sistem menggabungkan lebih dari 13 variabel data wajib (seperti Nomor Ijazah Nasional, Nama Universitas, Nama Mahasiswa, hingga IPK dan Tanggal Kelulusan) yang dipisahkan oleh karakter *pipe* ('|'). Kumpulan string ini kemudian dienkripsi satu arah menggunakan algoritma SHA-256 untuk menghasilkan *hash* unik sepanjang 64 karakter heksadesimal. Berikut adalah logika implementasi *hashing* tersebut:

    ```python
    # veda_backend/blockchain_utils.py
    def generate_diploma_hash(payload):
        # Penggabungan 13+ variabel data wajib dengan karakter pipe
        data_to_hash = (
            f"{payload.get('national_diploma_number')}|{payload.get('university_name')}|"
            f"{payload.get('student_name')}|{payload.get('student_id')}|{payload.get('gpa')}|"
            f"{payload.get('graduation_date')}|{payload.get('issuance_date')}"
            # ... variabel pendukung lainnya sesuai standar nasional
        )
        return "0x" + hashlib.sha256(data_to_hash.encode()).hexdigest()
    ```
    **Figure 6.4** Logika Pembangkitan Hash Ijazah SHA-256

    Metode ini memastikan bahwa perubahan satu karakter saja pada dokumen fisik (misalnya pemalsuan nilai IPK) akan menghasilkan *hash* yang sama sekali berbeda saat diverifikasi, sehingga anomali dapat langsung terdeteksi.
*   **Kekekalan Data (Immutability) pada Blockchain:** 
    Setelah *hash* ijazah berhasil ditransaksikan dan masuk ke dalam blok pada jaringan Ethereum (saat ini menggunakan *testnet* Sepolia), data tersebut dikunci oleh konsensus jaringan. Tidak ada pihak manapun, termasuk *Super Admin* atau Institusi penerbit, yang dapat memodifikasi atau menghapus jejak digital tersebut.
*   **Sinkronisasi Basis Data Sekunder:** 
    Basis data MySQL lokal (tabel tbl_diploma_record) berfungsi sebagai indeks pencarian cepat (caching layer). Tabel ini menyimpan metadata ijazah beserta *Transaction Hash* (TxHash) dari *blockchain*. Jika terjadi inkonsistensi akibat kerusakan basis data lokal, integritas sistem secara keseluruhan tidak akan terganggu karena keabsahan data (source of truth) selalu merujuk pada validasi mutlak yang berada di jaringan *blockchain*.

### 6.3 Security Maintenance and Risk Mitigation (Pemeliharaan Keamanan dan Mitigasi Risiko)
Meskipun implementasi teknis keamanan telah dijelaskan pada Bab 4, aspek pemeliharaan keamanan tetap krusial untuk menjaga integritas sistem dari ancaman yang terus berkembang. Strategi pemeliharaan keamanan pada Veda Diploma Auth berfokus pada langkah-langkah proaktif berikut:

*   **Pembaruan Dependensi Berkala (Dependency Patching):** 
    Komponen perangkat lunak seperti FastAPI, Web3.py, dan pustaka kriptografi lainnya harus diperbarui secara rutin. Pengembang wajib memantau kerentanan keamanan (*Security Advisories*) dan melakukan *patching* untuk mencegah serangan yang memanfaatkan kutu pada versi pustaka lama. Penggunaan alat seperti pip audit atau integrasi GitHub Dependabot sangat disarankan dalam fase pemeliharaan.
*   **Rotasi Kunci Rahasia dan Kredensial:** 
    Untuk meminimalisir dampak jika terjadi kebocoran data, sistem mendukung mekanisme rotasi SECRET_KEY pada JWT secara berkala. Selain itu, *Private Key* yang digunakan untuk menandatangani transaksi *blockchain* harus disimpan dalam layanan *Secret Management* yang aman (seperti HashiCorp Vault atau AWS Secrets Manager) dan diganti secara periodik sesuai dengan kebijakan keamanan institusi.
*   **Audit Kontrak Pintar (Smart Contract Auditing):** 
    Karena kode yang telah di-*deploy* ke *blockchain* sulit untuk diubah, pemeliharaan jangka panjang melibatkan audit kode secara berkala menggunakan alat statis seperti *Slither* atau *Mythril*. Jika ditemukan kerentanan baru pada standar ERC-721 atau kontrak terkait, tim pengembang harus menyiapkan rencana migrasi ke kontrak baru.
*   **Monitoring dan Logging Aktivitas Mencurigakan:** 
    Sistem pemeliharaan harus mencakup pemantauan log akses API untuk mendeteksi pola serangan seperti *brute-force* atau *credential stuffing*. Selain itu, monitoring terhadap *Transaction Hash* yang gagal di jaringan *blockchain* dilakukan untuk mengidentifikasi adanya masalah pada *node provider* atau kehabisan saldo (gas) pada akun Admin.
*   **Manajemen Sertifikat SSL/TLS:** 
    Memastikan sertifikat enkripsi untuk jalur komunikasi HTTPS antara *frontend* dan *backend* tetap valid. Otomasi pembaruan sertifikat (misal menggunakan Let's Encrypt) menjadi bagian tak terpisahkan dari pemeliharaan server agar data pengguna tidak terekspos dalam bentuk teks polos di jaringan.

### 6.4 Administrative & Data Maintenance (Pemeliharaan Administratif dan Data)
Keberlanjutan operasional aplikasi bergantung pada rutinitas administratif dan pemeliharaan struktur data yang baik:

*   **Kontrol Akses dan Revokasi Pengguna:** 
    Sistem menyediakan dasbor manajemen pengguna bagi *Super Admin*. Administrator dapat memantau aktivitas Institusi (*Issuer*). Fitur keamanan reaktif telah diimplementasikan; jika Admin mengubah status Institusi menjadi 'Inactive' (Tidak Aktif), lapisan otorisasi pada API akan langsung mendeteksi perubahan tersebut dan secara otomatis menolak token JWT yang masih aktif milik institusi terkait, sehingga akses diputus secara instan.
*   **Manajemen Koneksi Basis Data:** 
    Untuk mencegah aplikasi macet akibat koneksi *database* yang terputus secara diam-diam (*MySQL server has gone away*), konfigurasi SQLAlchemy mengaktifkan parameter `pool_pre_ping=True` (melakukan tes *ping* sebelum koneksi digunakan) dan `pool_recycle=3600` (mendaur ulang koneksi setiap 1 jam). Berikut adalah konfigurasi mesin basis data tersebut:

    ```python
    # veda_backend/database.py
    from sqlalchemy import create_engine

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        pool_pre_ping=True,    # Cek koneksi sebelum digunakan
        pool_recycle=3600      # Reset koneksi secara otomatis setiap jam
    )
    ```
    **Figure 6.5** Konfigurasi Engine Basis Data dengan Mekanisme Re-connection

    Hal ini menjamin stabilitas layanan dalam jangka waktu yang panjang.
*   **Prosedur Pencadangan (Backup) dan Pemulihan (Restore):** 
    Mengingat MySQL menyimpan data krusial terkait informasi lulusan (sebelum dikonversi menjadi *hash*), pemeliharaan rutin mengharuskan adanya proses *dump database* secara berkala. Jika terjadi kegagalan sistem atau *server crash*, administrator dapat dengan cepat memulihkan data menggunakan *file* cadangan SQL. Karena nilai kebenaran ijazah (*hash*) berada di *blockchain*, kehilangan data lokal tidak akan menyebabkan hilangnya status keabsahan ijazah yang telah diterbitkan.

### 6.5 Future Technical Evolution (Evolusi Teknis Sistem)
Sebagai sistem yang dirancang secara modular, Veda Diploma Auth memiliki peta jalan teknis untuk meningkatkan skalabilitas dan fleksibilitas arsitektur sistem di masa mendatang:

1.  **Implementasi Decentralized Identifiers (DID) dan Verifiable Credentials (VC):** 
    Adopsi standar W3C untuk DID dan VC guna memberikan alumni kontrol penuh atas identitas digital mereka. Dengan VC, alumni dapat menyimpan ijazah digital dalam *digital wallet* pribadi dan membagikannya secara selektif kepada pihak ketiga tanpa melalui perantara sistem pusat.
2.  **Penerbitan Ijazah sebagai Soulbound Tokens (SBT):** 
    Transisi dari standar token biasa ke *Soulbound Tokens* (SBT) yang bersifat *non-transferable* (tidak dapat dipindahtangankan). Hal ini memastikan bahwa ijazah digital secara permanen melekat pada identitas akademik individu and tidak dapat diperjualbelikan atau dipindahkan ke akun lain.
3.  **Optimalisasi Layer-2 dan Batch Processing:** 
    Untuk menangani penerbitan ijazah dalam jumlah masif (ribuan ijazah per semester), sistem teknis akan dikembangkan untuk mendukung *Batch Issuance*. Dengan teknik *Merkle Tree*, ribuan data ijazah dapat diringkas menjadi satu *root hash* tunggal yang dikirim ke *blockchain*, sehingga secara drastis mengurangi biaya gas dan beban komputasi pada jaringan.
4.  **Pengembangan API Gateway dan Microservices:** 
    Transisi dari arsitektur monolitik FastAPI ke *microservices* dapat dilakukan untuk memisahkan layanan otentikasi, layanan manajemen ijazah, dan layanan interaksi *blockchain*. Hal ini akan memungkinkan setiap komponen diskalakan secara independen sesuai beban trafik.
5.  **Integrasi IPFS untuk Penyimpanan Dokumen Visual:** 
    Guna mengatasi keterbatasan penyimpanan visual, pengembangan di masa depan akan mengintegrasikan *InterPlanetary File System* (IPFS). Berkas ijazah (PDF) akan disimpan secara terdesentralisasi, dan *Content Identifier* (CID) dari IPFS tersebut akan dicatat di *blockchain* bersamaan dengan *hash* data.
6.  **Implementasi Zero-Knowledge Proofs (ZKP):** 
    Untuk meningkatkan privasi lulusan, sistem dapat menerapkan ZKP (seperti zk-SNARKs). Hal ini memungkinkan alumni untuk membuktikan keabsahan ijazah atau kriteria tertentu (misal: IPK > 3.5) kepada pihak ketiga tanpa harus membongkar seluruh metadata ijazah yang sensitif.
7.  **Otomasi CI/CD Blockchain:** 
    Implementasi *pipeline* integrasi berkelanjutan yang secara otomatis menjalankan pengujian unit (unit testing) pada *Smart Contract* menggunakan *Hardhat* atau *Foundry* sebelum dilakukan *deployment*, guna memastikan tingkat keamanan kode tetap terjaga pada setiap pembaruan.
---

**CHAPTER 7**
**CONCLUSION AND RECOMMENDATIONS**

This chapter presents the final summary of the entire research, design, and implementation process of the Veda Diploma Auth system. It discusses the benefits generated, the technical experience gained, the system's limitations, and strategic recommendations for further application development.

### 7.1 Conclusion and System Benefits
Based on the implementation and testing results, it can be concluded that Veda Diploma Auth successfully addresses the challenge of diploma forgery through the utilization of blockchain technology. Some of the key benefits of this project include:
*   **Uncompromising Security:** The use of the SHA-256 algorithm and the Ethereum network ensures that every issued diploma has a unique digital fingerprint that is impossible for any party to manipulate.
*   **Verification Efficiency:** The diploma verification process, which previously required manual bureaucracy and significant time, can now be performed instantly by third parties (companies or institutions) simply by uploading the diploma metadata to the system.
*   **Decentralization of Trust:** The validity of a diploma no longer depends entirely on the existence of a university's physical server, but rather on the consensus of a global blockchain network that remains permanently active.

### 7.2 Implementation Lessons
During the development process of the Veda Diploma Auth system, the journey taken was not just about completing lines of code, but rather a deeply personal process of intellectual transformation. I gained not only profound technical understanding but also practical experience in facing logical deadlocks, managing emotions during debugging, and a paradigm shift in viewing data integrity. The following are in-depth reflections on the lessons learned:

*   **Conquering the Steep Web3 Learning Curve:** 
    In the early stages, the biggest challenge was not the syntax of the Solidity language, but the shift in mindset from a Centralized architecture toward a Decentralized one. Understanding concepts like Gas Fees, Gas Limit estimation, and event listening mechanisms on the blockchain took considerable time. I often found myself stuck in confusion when transactions failed without clear error messages (often just a "revert"). However, the moment the first transaction was successfully recorded on the Sepolia testnet—and seeing that hash appear on Etherscan—gave me an extraordinary sense of achievement. It was the turning point where I realized that the "new world" of Web3 could truly be integrated with modern web applications.
*   **Resilience and Satisfaction in Independent Debugging:** 
    One of the most crucial and emotional moments was developing the QR Code scanning feature on the frontend. A complex issue arose where the camera component was automatically duplicated every time the page was accessed or refreshed, which caused memory load to increase drastically. After hours of trying various solutions from official documentation and asking AI assistants, which only led to failure, I felt frustrated. However, through deep investigation in community forums (such as StackOverflow and GitHub discussions), I eventually discovered that the problem lay in the React lifecycle not properly cleaning up camera instances when components were unmounted. Successfully solving this problem independently—even going beyond the AI's suggestions—provided strong validation of my analytical skills. This moment taught me that in the era of automation, human precision and intuition remain the primary keys to solving complex problems.
*   **Bridging Two Worlds: Integrating Modern Full-stack and Web3:** 
    Building a "bridge" between traditional web technologies (FastAPI and MySQL) and a decentralized network through the `web3.py` and `ethers.js` libraries was a highly satisfying technical experience. I learned how to manage hybrid data synchronization. The technical challenge was how to keep the interface responsive and provide informative feedback to users while waiting for transactions to be processed by the relatively slow blockchain network. Designing elegant loading states and user-friendly error handling gave me a new perspective on the importance of User Experience (UX) in applications based on cutting-edge technology.
*   **Philosophy of Security and Data Immutability:** 
    Working with blockchain provided a deep philosophical realization of the meaning of "truth." In traditional database systems, data is fluid and can be modified (CRUD). However, on the blockchain, once diploma data enters a block, it becomes "eternal" and impossible to delete. This realization triggered visionary thoughts: if this technology can be used to lock the validity of a diploma, then its potential to increase public transparency is enormous. I imagine a future where public fund allocations or civil records are managed with the same absolute level of accountability, creating a more honest and transparent society.
*   **Reflections on Technological Awareness in Indonesia:** 
    During my research, I realized there is a fairly wide gap in blockchain literacy among the Indonesian public. This became a personal motivation not just to be a software developer, but also to be an educator. This experience made me realize that no matter how great a technology is, it will not provide maximum impact without inclusivity and understanding from its users. This is a call for me to continue contributing to the development of digital solutions that are not only sophisticated but also easy to understand and bring real benefits to the advancement of education in the country.
*   **Managing Complex Hybrid State:** 
    Learning to manage synchronization between local state in the browser, JWT authentication sessions in the backend, and transaction status in the digital wallet (MetaMask) provided a new understanding of complex state management. I had to ensure that users did not lose context while moving between entering data in React forms and providing digital signatures on their wallets. The harmony of this workflow is the result of countless iterations of testing.
*   **Boundless Exploration:** 
    Although the core system is complete, I feel this is just the beginning. The understanding of Decentralized Identifiers (DID) and Soulbound Tokens (SBT) gained during the research process has opened doors to even greater curiosity. Acknowledging that there is still much to learn serves as motivation for me to continue studying and conducting further research, proving that education and self-development is a never-ending process.

### 7.3 System Limitations
Despite its various advantages, this system still has several limitations that need to be considered:
*   **Dependency on Gas Fees:** Every transaction to issue a diploma requires a cost (gas) that fluctuates on the Ethereum network. This can become a cost barrier if the volume of issued diplomas is very large.
*   **Internet Connectivity Dependency:** Since the system is based on a public blockchain, the issuance and verification processes require a stable internet connection to communicate with network nodes.
*   **Lack of Visual Document Storage:** The system currently only records textual data in the form of a hash. There is no feature yet available to store and display diploma files in visual form (PDF) in a decentralized manner.
*   **User Knowledge Threshold:** Using blockchain still requires some technical understanding for university administrators, especially regarding wallet management and private keys.
*   **Blockchain Literacy Gap in Society:** Currently, the general public's understanding in Indonesia regarding decentralized concepts, private key security, and how blockchain works is still relatively low. This poses a significant challenge if the system is to be developed further toward Decentralized Identifiers (DID) and Verifiable Credentials (VC). Massive education is needed so that alumni can manage their own digital identities independently and securely.

### 7.4 Suggestions and Recommendations
Based on the research findings and identified limitations, I offer the following suggestions for stakeholders and future researchers:

1.  **Recommendations for Educational Institutions:**
    *   **Data Standardization:** Institutions are advised to perform audits and standardize diploma metadata before hashing to ensure consistency of information that will be permanently recorded on the blockchain.
    *   **Human Resource Training:** There is a need for socialization and training for academic administrative staff on how digital wallets work and the importance of maintaining Private Key confidentiality.
    *   **Independent Node Infrastructure:** For large-scale institutions, it is recommended to run independent Ethereum Nodes to increase data independence and reduce reliance on third-party service providers.

2.  **Suggestions for Future Researchers:**
    *   **Legal Aspect Analysis:** Further research the legal validity of blockchain-based diplomas within the framework of national education regulations in Indonesia.
    *   **Interoperability Studies:** Develop protocols so that diplomas from various universities using different blockchain networks can be cross-verified through a single gateway (cross-chain interoperability).
    *   **Implementation of Digital Identity (DID) and Soulbound Tokens (SBT):** Integrate this system with Decentralized Identifier (DID) and Soulbound Token (SBT) standards so that digital diplomas can be permanently attached to an individual's sovereign identity without the risk of ownership transfer.

3.  **System Operational Recommendations:**
    *   **Private Key Backup:** Institutions must store backups of seed phrases or private keys in physical form (paper wallets) kept in high-security vaults, as lost keys cannot be recovered.
    *   **Gas Fee Monitoring:** Use gas tracking tools to perform transactions when network traffic is low to minimize operational costs.
