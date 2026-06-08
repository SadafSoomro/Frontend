import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../API/api';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { data } = await forgotPasswordApi(email);
            setMessage(data.message || 'Reset code sent to your email');
            setTimeout(() => {
                navigate('/resetpassword', { state: { email } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <Link to="/" className="back-home-btn">
                <ArrowLeft size={16} /> Back to Store
            </Link>

            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Forgot Password</h2>
                        <p>Enter your email to receive a reset code</p>
                    </div>

                    {message && (
                        <div className="success-msg" style={{
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            color: '#81c784',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem'
                        }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-msg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="modern-form">
                        <div className="modern-form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="modern-auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Code'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="form-footer">
                        <span>Remembered your password? <Link to="/login">Back to Login</Link></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
