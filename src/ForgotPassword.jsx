import React, { useState } from 'react';
import { auth } from './firebase';
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email) {
            setMessage({ text: 'Please enter your registered email.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            // Firebase reset link bhejta hai
            await sendPasswordResetEmail(auth, email);
            setMessage({ 
                text: 'Reset link sent! Please check your Gmail inbox.', 
                type: 'success' 
            });
            setEmail('');
        } catch (error) {
            console.error(error);
            setMessage({ 
                text: 'Email not found or error occurred.', 
                type: 'error' 
            });
        }
        setLoading(false);
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={iconCircle}>📧</div>
                <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Forgot Password?</h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
                    Enter your admin email and we'll send you a link to reset your password.
                </p>

                {message.text && (
                    <div style={{ 
                        background: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
                        color: message.type === 'success' ? '#15803d' : '#ef4444', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleReset}>
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                            Admin Email
                        </label>
                        <input 
                            type="email" 
                            placeholder="admin@example.com"
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            ...btnStyle, 
                            background: loading ? '#94a3b8' : '#003366',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ marginTop: '25px' }}>
                    <button 
                        onClick={() => onNavigate('login')} 
                        style={backBtnStyle}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#003366', // Aapke portal ki theme wala color
    padding: '20px'
};

const cardStyle = {
    background: 'white',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
};

const iconCircle = {
    width: '60px',
    height: '60px',
    background: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    margin: '0 auto 20px auto'
};

const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: '0.2s'
};

const btnStyle = {
    width: '100%',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: '0.3s'
};

const backBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#003366',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '5px 10px'
};

export default ForgotPassword;