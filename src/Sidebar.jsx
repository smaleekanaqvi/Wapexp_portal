import React from 'react';
// Lucide icons import karein
import { LayoutDashboard, Users, GraduationCap, Wallet, LogOut,UserCheck } from 'lucide-react';


const Sidebar = ({ activePage, onNavigate, onLogout }) => {
    // Icons ko objects mein update kiya
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} color="white" /> },
        { id: 'students', label: 'Students', icon: <Users size={20} color="white" /> },
        { id: 'teachers', label: 'Instructor', icon: <GraduationCap size={20} color="white" /> },
        { id: 'fee', label: 'Fee Management', icon: <Wallet size={20} color="white" /> },
        { id: 'attendance', label: 'Attendance', icon: <UserCheck size={20} color="white" /> },
    ];

    return (
        <>
            <style>{`
                :root {
                    --sidebar-bg: #001e3c; 
                    --accent-green: #22c55e;
                    --text-main: #ffffff;
                    --text-dim: #94a3b8;
                }

                .sidebar-container {
                    width: 260px;
                    background-color: var(--sidebar-bg);
                    height: 100vh;
                    color: var(--text-main);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0; top: 0;
                    font-family: 'Inter', sans-serif;
                }

                .sidebar-header {
                    padding: 30px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .logo-box {
                    width: 45px;
                    height: 45px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .logo-img {
                    width: 85%;
                    height: 85%;
                    object-fit: contain;
                }

                .brand-name {
                    font-size: 22px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                }

                .nav-menu {
                    flex: 1;
                    padding: 10px 15px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    margin-bottom: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    color: var(--text-dim);
                    transition: all 0.2s ease;
                    font-weight: 500;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                }

                .nav-item.active {
                    background: var(--accent-green);
                    color: white;
                }

                /* Icon spacing fix */
                .icon-container {
                    display: flex;
                    align-items: center;
                    margin-right: 12px;
                }

                .logout-box {
                    padding: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                .logout-btn {
                    width: 100%;
                    padding: 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .logout-btn:hover {
                    background: #ef4444;
                    color: white;
                }
            `}</style>

            <div className="sidebar-container">
                <div className="sidebar-header">
                    <div className="logo-box">
                        <img src="/wapexp.jpeg" alt="WEBEXP Logo" className="logo-img" />
                    </div>
                    <span className="brand-name">WEBEXP</span>
                </div>

                <nav className="nav-menu">
                    {menuItems.map((item) => (
                        <div 
                            key={item.id}
                            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            <span className="icon-container">{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </nav>

                <div className="logout-box">
                    <button className="logout-btn" onClick={onLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;