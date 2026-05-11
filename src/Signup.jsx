import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

// Lucide Icons Import
import { User, Mail, Phone, Lock, ShieldCheck, Loader, ArrowRight } from 'lucide-react';

const Signup = ({ onNavigate, onLogin }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Google Sign Up Logic ---
    const handleGoogleSignUp = async () => {
        const provider = new GoogleAuthProvider();
        setError('');
        try {
            await signInWithPopup(auth, provider);
            alert("Google Sign up Successful!");
            if (onLogin) onLogin();
        } catch (err) {
            setError("Google sign-up failed. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match!");
        }
        if (formData.password.length < 6) {
            return setError("Password should be at least 6 characters.");
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            alert("Account Created Successfully!");
            if (onNavigate) onNavigate('login'); // Redirect to login after signup
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page-wrapper">
            <style>{`
                /* --- Font Import --- */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                /* --- Global Reset --- */
                *, *::before, *::after {
                    box-sizing: border-box; /* Prevents scrollbars */
                }

                :root {
                    --primary: #002244;
                    --accent: #22c55e;
                    --accent-hover: #16a34a;
                    --text-dark: #0f172a;
                    --text-gray: #64748b;
                    --border: #e2e8f0;
                    --bg-glass: white;
                }

                .signup-page-wrapper {
                    width: 100%;
                    min-height: 100vh;
                    background: #002244;
                    /* Consistent Gradient Background */
                    background-image: 
                        radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 100% 100%, rgba(34, 197, 94, 0.1) 0%, transparent 40%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    padding: 20px;
                }

                .signup-card {
                    background: var(--bg-glass);
                    width: 100%;
                    max-width: 460px; /* Slightly wider for more inputs */
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                }

                /* --- Header Section --- */
                .header-section {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo-circle {
                    width: 64px;
                    height: 64px;
                    background: white;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 15px auto;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                }
                .brand-name {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: -0.5px;
                    display: block;
                    margin-bottom: 6px;
                }
                .subtitle {
                    color: var(--text-gray);
                    font-size: 14px;
                    margin: 0;
                }

                /* --- Form Controls --- */
                .form-group { margin-bottom: 16px; }
                .label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-dark);
                    margin-bottom: 8px;
                    margin-left: 2px;
                }

                .input-wrapper { position: relative; }
                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    width: 18px;
                    height: 18px;
                    z-index: 1;
                }

                .input-field {
                    width: 100%;
                    padding: 12px 16px 12px 42px;
                    border: 1.5px solid var(--border);
                    border-radius: 12px;
                    font-size: 14px;
                    color: var(--text-dark);
                    background: #fcfdfe;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .input-field:focus {
                    border-color: var(--accent);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
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
                    gap: 8px;
                    transition: all 0.3s;
                    margin-top: 8px;
                }

                .btn-primary:hover {
                    background: var(--accent-hover);
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
                    transform: translateY(-1px);
                }
                .btn-primary:disabled {
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .btn-google {
                    width: 100%;
                    background: white;
                    border: 1.5px solid var(--border);
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

                /* --- Divider --- */
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
                    content: ''; flex: 1; height: 1px; background: var(--border);
                }
                .divider span { padding: 0 15px; }

                /* --- Error Box --- */
                .error-box {
                    background: #fef2f2;
                    color: #ef4444;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    margin-bottom: 20px;
                    border: 1px solid #fee2e2;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* --- Footer --- */
                .footer-text {
                    text-align: center;
                    margin-top: 25px;
                    font-size: 14px;
                    color: var(--text-gray);
                }
                .link-btn {
                    color: var(--primary);
                    font-weight: 700;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0 4px;
                }

                /* --- Responsive Media Queries --- */
                @media (max-width: 500px) {
                    .signup-card {
                        padding: 30px 24px;
                        border-radius: 20px;
                        margin: 0 10px;
                    }
                    .header-section h1 {
                        font-size: 20px;
                    }
                    .logo-circle {
                        width: 56px;
                        height: 56px;
                    }
                    .input-field {
                        font-size: 13px;
                    }
                }
            `}</style>

            <div className="signup-card">
                {/* --- Logo & Header --- */}
                <div className="header-section">
                    <div className="logo-circle">
                        {/* Assuming you want the same logo as login */}
                        <img src="/wapexp.jpeg" alt="WEBEXP Logo" style={{width: '40px', height: '40px', objectFit: 'contain'}} />
                    </div>
                    <h1 className="brand-name">WEBEXP</h1>
                    <p className="subtitle">Create your admin account</p>
                </div>

                {error && (
                    <div className="error-box">
                        <ShieldCheck size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="ALI"
                                required 
                                value={formData.fullName} 
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="admin@webexp.com"
                                required 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Phone Number</label>
                        <div className="input-wrapper">
                            <Phone size={18} className="input-icon" />
                            <input 
                                type="tel" 
                                className="input-field" 
                                placeholder="+92 300 1234567"
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="••••••••"
                                required 
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="••••••••"
                                required 
                                value={formData.confirmPassword} 
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <Loader size={20} className="spin" style={{animation: 'spin 1s linear infinite'}} />
                        ) : (
                            <>
                                Create Account <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>Or continue with</span>
                </div>

                <button type="button" onClick={handleGoogleSignUp} className="btn-google">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google Account
                </button>

                <div className="footer-text">
                    Already have an account? 
                    <button 
                        type="button" 
                        className="link-btn" 
                        onClick={() => onNavigate('login')}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Signup;