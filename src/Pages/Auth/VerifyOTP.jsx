import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtpApi, resendOtpApi } from '../../API/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { data } = await verifyOtpApi({ email, otp });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setError('');
        setMessage('');
        setResending(true);

        try {
            const { data } = await resendOtpApi(email);
            setMessage(data.message || 'New code sent to your email');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to resend code');
        } finally {
            setResending(false);
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
                            <p>Please sign up first to receive a verification code.</p>
                        </div>
                        <Link to="/signup" className="modern-auth-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            Go to Sign Up <ArrowRight size={16} />
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
                        <h2>Enter Verification Code</h2>
                        <p>Sent to <strong>{email}</strong></p>
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
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="123456"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.4rem', fontWeight: 700 }}
                            />
                        </div>

                        <button type="submit" className="modern-auth-btn" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="form-footer" style={{ marginTop: '0.5rem' }}>
                        <span>Didn't receive the code?</span>{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary, #e21b26)', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit', fontWeight: 'bold' }}
                        >
                            {resending ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
