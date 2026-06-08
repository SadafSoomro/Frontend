import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPasswordApi } from '../../API/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const { data } = await resetPasswordApi({ email, otp, password });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="auth-split-layout">
                <Link to="/" className="back-home-btn">
                    <ArrowLeft size={16} /> Back to Store
                </Link>

                <div className="auth-form-panel">
                    <div className="form-container">
                        <div className="form-header">
                            <h2>Email Required</h2>
                            <p>Please request a password reset first.</p>
                        </div>
                        <Link to="/forgotpassword" className="modern-auth-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            Forgot Password <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-split-layout">
            <Link to="/" className="back-home-btn">
                <ArrowLeft size={16} /> Back to Store
            </Link>

            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Reset Password</h2>
                        <p>Enter the code sent to <strong>{email}</strong> and your new password</p>
                    </div>

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
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="123456"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.3rem' }}
                            />
                        </div>

                        <div className="modern-form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="modern-form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="modern-auth-btn" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
