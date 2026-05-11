import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setError('');
        try {
            await signInWithPopup(auth, provider);
            if (onLogin) onLogin(); 
        } catch (err) {
            setError("Google login failed. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (onLogin) onLogin();
        } catch (err) {
            setError("Invalid credentials or connection issue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                /* --- Global Reset --- */
                *, *::before, *::after {
                    box-sizing: border-box;
                }

                :root {
                    --primary: #002244;
                    --accent: #22c55e;
                    --accent-hover: #16a34a;
                    --text-dark: #0f172a;
                    --text-gray: #64748b;
                    --bg-soft: #f8fafc;
                }

                .login-page-wrapper {
                    width: 100%;
                    min-height: 100vh;
                    background: #002244;
                    background-image: 
                        radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 100% 100%, rgba(34, 197, 94, 0.1) 0%, transparent 40%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    padding: 20px;
                }

                .login-card {
                    background: white;
                    width: 100%;
                    max-width: 440px;
                    border-radius: 28px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    padding: 45px 40px;
                    position: relative;
                    overflow: hidden;
                }

                /* --- Logo Styling --- */
                .logo-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .logo-circle {
                    width: 70px;
                    height: 70px;
                    background: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.06);
                    border: 1px solid #f1f5f9;
                    margin-bottom: 15px;
                }

                .logo-img {
                    width: 50px;
                    height: 50px;
                    object-fit: contain;
                }

                .brand-name {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: -0.5px;
                }

                .header-text {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .header-text h1 {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text-dark);
                    margin: 0 0 6px 0;
                }
                .header-text p {
                    color: var(--text-gray);
                    font-size: 14px;
                }

                /* --- Form Controls --- */
                .form-group { margin-bottom: 18px; }
                .label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-dark);
                    margin-bottom: 8px;
                    margin-left: 4px;
                }

                .input-wrapper { position: relative; }
                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    z-index: 1;
                }

                .input-field {
                    width: 100%; /* Fixed for responsiveness */
                    padding: 12px 16px 12px 42px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 15px;
                    transition: all 0.2s ease;
                    background: #fcfdfe;
                }

                .input-field:focus {
                    border-color: var(--accent);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
                    outline: none;
                }

                .toggle-password {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    cursor: pointer;
                    z-index: 1;
                }

                /* --- Buttons --- */
                .btn-primary {
                    width: 100%;
                    background: var(--accent);
                    color: white;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                    margin-top: 10px;
                }

                .btn-primary:hover {
                    background: var(--accent-hover);
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
                }
                .btn-primary:disabled {
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .btn-google {
                    width: 100%;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 15px;
                }
                .btn-google:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 25px 0;
                    color: #94a3b8;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .divider::before, .divider::after {
                    content: ''; flex: 1; height: 1px; background: #e2e8f0;
                }
                .divider span { padding: 0 15px; }

                /* --- Animation --- */
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- RESPONSIVE MEDIA QUERIES --- */
                @media (max-width: 480px) {
                    .login-card {
                        padding: 30px 24px;
                        border-radius: 20px;
                        margin: 0 10px; /* Side margin on very small screens */
                    }
                    
                    .header-text h1 {
                        font-size: 20px;
                    }

                    .logo-circle {
                        width: 60px;
                        height: 60px;
                        border-radius: 16px;
                    }
                    
                    .logo-img {
                        width: 40px;
                        height: 40px;
                    }

                    .brand-name {
                        font-size: 20px;
                    }

                    .input-field {
                        font-size: 14px;
                    }
                }
            `}</style>

            <div className="login-card">
                <div className="logo-container">
                    <div className="logo-circle">
                        {/* Using the local logo you provided */}
                        <img src="/wapexp.jpeg" alt="WEBEXP Logo" className="logo-img" />
                    </div>
                    <span className="brand-name">WEBEXP</span>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2', 
                        color: '#ef4444', 
                        padding: '12px', 
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        marginBottom: '20px', 
                        border: '1px solid #fee2e2', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px'
                    }}>
                        <ShieldCheck size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="name@company.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="input-field" 
                                placeholder="••••••••"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display:'flex', 
                        justifyContent:'space-between', 
                        fontSize:'13px', 
                        marginBottom:'25px',
                        alignItems: 'center'
                    }}>
                        <label style={{
                            display:'flex', 
                            alignItems:'center', 
                            gap:'8px', 
                            cursor:'pointer', 
                            color: 'var(--text-gray)'
                        }}>
                            <input 
                                type="checkbox" 
                                style={{accentColor: '#22c55e', width: '16px', height: '16px'}} 
                            /> 
                            Remember me
                        </label>
                        <button 
                            type="button" 
                            style={{
                                color: 'var(--accent)', 
                                fontWeight:'700', 
                                border:'none', 
                                background:'none', 
                                cursor:'pointer',
                                padding: 0
                            }} 
                            onClick={() => onNavigate('forgot-password')}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <span style={{
                                width:'20px', 
                                height:'20px', 
                                border:'3px solid rgba(255,255,255,0.3)', 
                                borderTopColor:'white', 
                                borderRadius:'50%', 
                                animation:'spin 0.8s linear infinite'
                            }}></span>
                        ) : (
                            <>
                                <LogIn size={20} /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>Or continue with</span>
                </div>

                <button type="button" onClick={handleGoogleLogin} className="btn-google">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google Account
                </button>

                <div style={{
                    textAlign: 'center', 
                    marginTop: '25px', 
                    fontSize: '14px', 
                    color: 'var(--text-gray)'
                }}>
                    New here?{' '}
                    <button 
                        type="button" 
                        style={{
                            color: 'var(--primary)', 
                            fontWeight: '700', 
                            border: 'none', 
                            background: 'none', 
                            cursor: 'pointer'
                        }} 
                        onClick={() => onNavigate('signup')}
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;