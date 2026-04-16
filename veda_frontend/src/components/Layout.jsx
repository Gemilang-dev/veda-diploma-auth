import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Sidebar di kiri (fixed) */}
            <Sidebar />
            
            {/* Konten utama di kanan (bergeser 260px sesuai lebar sidebar) */}
            <div style={{ flex: 1, marginLeft: '260px' }}>
                
                {/* Topbar Opsional seperti di gambar */}
                <div style={{ backgroundColor: '#fff', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Manage Diploma System</h2>
                    <span style={{ color: '#666', fontSize: '14px' }}>Current Session: 2025-2026</span>
                </div>

                {/* Area Konten Dinamis (Issue / Verify) */}
                <div style={{ padding: '30px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;