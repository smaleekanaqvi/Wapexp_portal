import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, query, orderBy, limit, addDoc } from "firebase/firestore";
import Sidebar from './Sidebar'; 
import Students from './Students';
import Teachers from './Teachers'; 
import Fees from './Fees';
import Attendance from './Attendance';

import { 
  Users, GraduationCap, Wallet, BookOpen, 
  AlertCircle, Calendar, Clock, TrendingUp, CheckCircle, Search
} from 'lucide-react';

const Dashboard = ({ onLogout }) => {
    const [view, setView] = useState('dashboard');
    const [feesList, setFeesList] = useState([]);
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        pendingFees: 0,
        activeCourses: 0
    });

    useEffect(() => {
        const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
            setStats(prev => ({ ...prev, totalStudents: snapshot.size }));
        });

        const unsubTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
            setStats(prev => ({ ...prev, totalTeachers: snapshot.size }));
        });

        const unsubFees = onSnapshot(collection(db, "fees"), (snapshot) => {
            let totalPending = 0;
            const feesData = [];
            const courses = new Set();
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                feesData.push({ id: doc.id, ...data });
                totalPending += Number(data.remaining || 0);
                if(data.course) courses.add(data.course);
            });
            
            setFeesList(feesData);
            setStats(prev => ({ 
                ...prev, 
                pendingFees: totalPending, 
                activeCourses: courses.size 
            }));
        });

        const qPay = query(collection(db, "payments"), orderBy("date", "desc"), limit(20));
        const unsubPay = onSnapshot(qPay, (snapshot) => {
            setPayments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { 
            unsubStudents(); 
            unsubTeachers(); 
            unsubFees(); 
            unsubPay(); 
        };
    }, []);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const [y, m, d] = parts;
                const shortYear = y.slice(-2);
                return `${d}-${m}-${shortYear}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    const isPaymentToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return (
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth &&
            d.getDate() === now.getDate()
        );
    };

    const overdueReminders = feesList.filter(f => {
        if (f.status === 'Completed') return false;
        const d2 = f.installment2Date;
        const d3 = f.installment3Date;
        return (d2 && d2 < todayStr) || (d3 && d3 < todayStr);
    });

    const monthlyReminders = feesList.filter(f => {
        if (f.status === 'Completed') return false;
        const checkMonth = (date) => {
            if (!date) return false;
            const d = new Date(date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && date >= todayStr;
        };
        return checkMonth(f.installment2Date) || checkMonth(f.installment3Date);
    });

    const todaysPayments = payments.filter(p => isPaymentToday(p.date));

    return (
        <div className="dashboard-wrapper">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                :root {
                    --primary: #002244;
                    --primary-light: #e6eaf0;
                    --success: #16a34a;
                    --success-bg: #dcfce7;
                    --danger: #dc2626;
                    --danger-bg: #fee2e2;
                    --purple: #9333ea;
                    --purple-bg: #f3e8ff;
                    --accent: #22c55e;
                    --accent-hover: #16a34a;
                    --bg: #f8fafc;
                    --text-dark: #0f172a;
                    --text-gray: #64748b;
                    --border: #e2e8f0;
                    --card-border: #e2e8f0;
                    --font-main: 'Inter', sans-serif;
                    --sidebar-width: 260px;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .dashboard-wrapper {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--bg);
                    font-family: var(--font-main);
                }

                .main-content {
                    flex: 1;
                    margin-left: var(--sidebar-width);
                    padding: 36px 40px;
                    min-height: 100vh;
                    overflow-x: auto;
                    overflow-y: auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .header-text h2 {
                    font-size: 26px;
                    font-weight: 700;
                    color: var(--text-dark);
                    margin: 0;
                }

                .header-text p {
                    margin: 4px 0 0;
                    color: var(--text-gray);
                    font-size: 14px;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                
                .search-wrapper { 
                    position: relative; 
                }
                .search-wrapper input {
                    width: 280px;
                    padding: 10px 12px 10px 40px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    font-size: 14px;
                    background: white;
                    outline: none;
                    transition: 0.2s;
                    font-family: var(--font-main);
                }
                .search-wrapper input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(0, 34, 68, 0.08);
                }
                .search-icon {
                    position: absolute; 
                    left: 12px; 
                    top: 50%; 
                    transform: translateY(-50%);
                    color: var(--text-gray); 
                    pointer-events: none;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .card {
                    background: white;
                    border-radius: 14px;
                    padding: 22px;
                    border: 1px solid var(--card-border);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    transition: box-shadow 0.2s;
                }

                .card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }

                .stat-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-gray);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 6px;
                }
                
                .currency-wrapper {
                    display: inline-flex;
                    align-items: baseline;
                }
                
                .currency-symbol {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-gray);
                    margin-right: 4px;
                }
                
                .currency-amount {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-dark);
                }

                .list-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .list-item:last-child {
                    border-bottom: none;
                }

                .list-info {
                    display: flex;
                    flex-direction: column;
                }
                .list-info h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-dark);
                }
                .date-badge {
                    font-size: 11px;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 4px;
                    background: #f1f5f9;
                    padding: 2px 8px;
                    border-radius: 4px;
                    width: fit-content;
                }
                
                .badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .btn-sm {
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    border: none;
                    transition: 0.2s;
                }
                .btn-outline {
                    background: transparent;
                    border: 1px solid var(--danger);
                    color: var(--danger);
                }
                .btn-outline:hover {
                    background: var(--danger-bg);
                }

                .accent-navy { background: var(--primary); }
                .accent-green { background: var(--success); }
                .accent-red { background: var(--danger); }
                .accent-purple { background: var(--purple); }
                .text-red { color: var(--danger); }
                .text-purple { color: var(--purple); }
                .text-navy { color: var(--primary); }
                .text-green { color: var(--success); }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 16px;
                    color: var(--text-dark);
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 20px;
                }

                .empty-state {
                    text-align: center;
                    padding: 30px;
                    color: #94a3b8;
                }

                .empty-state p {
                    font-size: 13px;
                    margin-top: 4px;
                }

                .section-divider {
                    height: 4px;
                    border-radius: 4px 4px 0 0;
                    margin: -22px -22px 0 -22px;
                    margin-bottom: 18px;
                }

                @media (max-width: 1200px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0;
                        padding: 20px 16px;
                        padding-top: 70px;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .header-actions {
                        width: 100%;
                    }
                    .search-wrapper input {
                        width: 100%;
                    }
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .stat-label { font-size: 11px; }
                    .currency-amount { font-size: 22px; }
                    .card { padding: 16px; }
                    .main-content { padding: 16px 12px; padding-top: 70px; }
                }
            `}</style>
            
            <Sidebar activePage={view} onNavigate={(pageId) => setView(pageId)} onLogout={onLogout} />
            
            <main className="main-content">
                {view === 'dashboard' && (
                    <div className="page-header">
                        <div className="header-text">
                            <h2>Dashboard Overview</h2>
                            <p>Track your institute's growth and financials.</p>
                        </div>
                        <div className="header-actions">
                            <div className="search-wrapper">
                                <Search size={16} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search student name..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
              
                {view === 'dashboard' ? (
                    <>
                        <div className="stats-grid">
                            <div className="card">
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '18px'}}>
                                    <div className="accent-navy" style={{width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                                        <Users size={20} />
                                    </div>
                                    <div style={{background: '#f0fdf4', padding: '6px', borderRadius: '8px', color: '#16a34a'}}>
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <div className="stat-label">Total Students</div>
                                <div className="currency-amount">{stats.totalStudents}</div>
                            </div>

                            <div className="card">
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '18px'}}>
                                    <div className="accent-green" style={{width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                                        <GraduationCap size={20} />
                                    </div>
                                </div>
                                <div className="stat-label">Total Instructors</div>
                                <div className="currency-amount">{stats.totalTeachers}</div>
                            </div>

                            <div className="card">
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '18px'}}>
                                    <div className="accent-red" style={{width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                                        <Wallet size={20} />
                                    </div>
                                </div>
                                <div className="stat-label">Pending Fees</div>
                                <div className="currency-wrapper">
                                    <span className="currency-symbol">RS</span>
                                    <span className="currency-amount">{(stats.pendingFees || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="card">
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '18px'}}>
                                    <div className="accent-purple" style={{width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                                        <BookOpen size={20} />
                                    </div>
                                </div>
                                <div className="stat-label">Active Courses</div>
                                <div className="currency-amount">{stats.activeCourses}</div>
                            </div>
                        </div>

                        <div className="content-grid">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
                                    <div className="card-header text-red">
                                        <AlertCircle size={20} /> Overdue Installments
                                    </div>
                                    {overdueReminders.length > 0 ? (
                                        overdueReminders.map(f => {
                                            let overdueDate = null;
                                            if(f.installment2Date && f.installment2Date < todayStr) overdueDate = f.installment2Date;
                                            else if(f.installment3Date && f.installment3Date < todayStr) overdueDate = f.installment3Date;

                                            return (
                                                <div key={f.id} className="list-item">
                                                    <div className="list-info">
                                                        <h4>{f.studentName}</h4>
                                                        <span className="date-badge text-red">
                                                            <Calendar size={11} /> {formatDateDisplay(overdueDate)}
                                                        </span>
                                                        <div className="currency-wrapper" style={{marginTop: '4px'}}>
                                                            <span className="currency-symbol">RS</span>
                                                            <span style={{fontSize:'14px', fontWeight:'700'}}>{f.remaining}</span> 
                                                            <span style={{color:'#ef4444', marginLeft:'8px', fontSize:'12px'}}>Pending</span>
                                                        </div>
                                                    </div>
                                                    <button className="btn-sm btn-outline">Remind</button>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>No overdue payments.</div>
                                    )}
                                </div>

                                <div className="card" style={{ borderTop: '4px solid var(--purple)' }}>
                                    <div className="card-header text-purple">
                                        <Calendar size={20} /> Due This Month
                                    </div>
                                    {monthlyReminders.length > 0 ? (
                                        monthlyReminders.map(f => {
                                            let dueDate = null;
                                            if(f.installment2Date && f.installment2Date >= todayStr) dueDate = f.installment2Date;
                                            else if(f.installment3Date && f.installment3Date >= todayStr) dueDate = f.installment3Date;

                                            return (
                                                <div key={f.id} className="list-item">
                                                    <div className="list-info">
                                                        <h4>{f.studentName}</h4>
                                                        <span style={{fontSize: '12px', color: '#64748b', marginBottom: '2px'}}>{f.course}</span>
                                                        <span className="date-badge text-purple">
                                                            <Calendar size={11} /> {formatDateDisplay(dueDate)}
                                                        </span>
                                                    </div>
                                                    <span className="badge" style={{background: 'var(--purple-bg)', color: 'var(--purple)'}}>
                                                        Upcoming
                                                    </span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>No payments due this month.</div>
                                    )}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header text-navy">
                                    <Clock size={20} /> Recent Payments
                                </div>
                                {todaysPayments.length > 0 ? 
                                    todaysPayments.map(p => (
                                        <div key={p.id} className="list-item">
                                            <div className="list-info">
                                                <h4 style={{margin: 0}}>{p.name}</h4>
                                                <span className="date-badge text-navy" style={{marginTop: '4px'}}>
                                                    <Calendar size={11} /> {formatDateDisplay(p.date)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CheckCircle size={18} className="text-green" />
                                                <div className="currency-wrapper">
                                                    <span className="currency-symbol">RS</span>
                                                    <span className="currency-amount" style={{fontSize: '16px'}}>{p.amount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                    <div className="empty-state">
                                        <Clock size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                                        <p>No payments received today.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : view === 'students' ? (
                    <Students />
                ) : view === 'teachers' ? (
                    <Teachers />
                ) : view === 'attendance' ? (
                    <Attendance />
                ) : (
                    <Fees />
                )}
            </main>
        </div>
    );
};

export default Dashboard;