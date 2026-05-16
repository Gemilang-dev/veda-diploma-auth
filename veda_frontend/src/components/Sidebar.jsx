import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaQrcode, FaThLarge, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    const location = useLocation(); // To detect active menu item

    // Sidebar menu items
    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: <FaThLarge /> },
        { path: '/issue', name: 'Issue Diploma', icon: <FaGraduationCap /> },
        { path: '/verify', name: 'Verify Document', icon: <FaQrcode /> },
        { path: '/settings', name: 'Settings', icon: <FaCog /> },
    ];

    return (
        <div style={{ 
            width: '260px', 
            backgroundColor: '#2C3E50', 
            color: 'white', 
            height: '100vh', 
            position: 'fixed', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}>
            {/* Header / Logo Area */}
            <div style={{ 
                padding: '20px', 
                borderBottom: '1px solid #1abc9c', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px' 
            }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#2C3E50', fontWeight: 'bold' }}>
                    IBU
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Super Admin</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#bdc3c7' }}>Burch University</p>
                </div>
            </div>

            {/* Menu Links */}
            <nav style={{ marginTop: '20px', flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '15px 25px',
                                color: 'white',
                                textDecoration: 'none',
                                backgroundColor: isActive ? '#1abc9c' : 'transparent', // Green if active
                                borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            <span style={{ fontSize: '15px', fontWeight: isActive ? 'bold' : 'normal' }}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button at the bottom */}
            <div style={{ padding: '20px' }}>
                <Link to="/" style={{
                    display: 'flex', alignItems: 'center', gap: '15px', color: '#e74c3c', textDecoration: 'none', padding: '10px 5px'
                }}>
                    <FaSignOutAlt style={{ fontSize: '18px' }} />
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Logout</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;