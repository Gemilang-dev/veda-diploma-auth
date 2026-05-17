PANDUAN MENJALANKAN PROYEK VEDA (LINUX)
======================================

Aplikasi: VEDA (Verifiable Educational Diploma Authenticator)
Arsitektur: Backend (FastAPI) & Frontend (React Vite)
Lingkungan: Localhost (Linux)

-----------------------------------------------------------------
1. BACKEND (Python FastAPI)
-----------------------------------------------------------------

Langkah Awal (Jika folder 'venv' belum dibuat/tidak ada):
1. Buka terminal Linux Anda.
2. Masuk ke folder lokasi backend berada:
   cd /path/to/your/veda_backend
3. Pastikan dependensi sistem python3-venv dan pip sudah terinstall di Linux:
   sudo apt update
   sudo apt install python3-venv python3-pip
4. Buat virtual environment baru dengan nama 'venv':
   python3 -m venv venv

Cara Menjalankan Backend:
1. Buka terminal baru dan masuk ke folder backend Anda:
   cd /path/to/your/veda_backend

2. Aktifkan Virtual Environment (venv):
   source venv/bin/activate
  
3. Install atau perbarui dependensi library (Hanya jika venv baru dibuat):
   pip install --upgrade pip
   pip install -r requirements.txt
   *Catatan: Jika file requirements.txt tidak ditemukan, install library utama secara manual:
   pip install fastapi uvicorn sqlalchemy mysqlconnector-python python-dotenv web3

4. Pastikan Database MySQL Anda sudah menyala:
   - Jika menggunakan XAMPP/LAMPP Linux:
     sudo /opt/lampp/lampp start
   - Jika menggunakan MySQL native:
     sudo systemctl start mysql

5. Jalankan server backend FastAPI menggunakan Uvicorn:
   uvicorn main:app --reload

6. Backend sekarang aktif secara lokal di: http://127.0.0.1:8000

-----------------------------------------------------------------
2. FRONTEND (React.js + Vite)
-----------------------------------------------------------------

Langkah Awal (Jika folder 'node_modules' belum ada):
1. Masuk ke folder lokasi frontend berada (tempat file package.json berada):
   cd /path/to/your/veda_frontend
   
2. Install kembali package dependensi React:
   npm install
   *Catatan: Jika perintah 'npm' tidak ditemukan, pasang Node.js terlebih dahulu:
   sudo apt install nodejs npm

Cara Menjalankan Frontend:
1. Buka TERMINAL BARU secara terpisah (jangan digabung dengan terminal backend).
2. Masuk ke folder frontend Anda:
   cd /path/to/your/veda_frontend
3. Jalankan server pengembangan menggunakan Vite:
   npm run dev
4. Frontend sekarang aktif dan dapat diakses melalui browser di alamat: http://localhost:5173

-----------------------------------------------------------------
3. CATATAN PENTING & KONFIGURASI
-----------------------------------------------------------------
- File Tersembunyi (.env): Pastikan file '.env' dan 'abi.json' tetap berada di dalam root folder backend Anda. Di Linux, file berawalan titik bersifat tersembunyi, gunakan perintah 'ls -a' di terminal untuk melihatnya.
- Google OAuth: Karena Anda masih berjalan di localhost, pastikan konfigurasi pada Google Cloud Console Anda disetel seperti berikut:
  * Authorized JavaScript origins: http://localhost:5173
  * Authorized redirect URIs: http://localhost:5173 (atau sesuaikan dengan callback route login Anda)
  * Pastikan TIDAK ADA tanda garis miring (/) di bagian akhir URL pada Google Console.
- Sinkronisasi: Jangan lupa menyalin Google Client ID baru hasil generate ke file .env proyek Anda agar fitur Login Google dapat langsung digunakan.


