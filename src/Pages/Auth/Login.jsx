import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../../API/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        password: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await loginApi(formData);
            login(data);

            const redirectTo = location.state?.from || '/';
            navigate(redirectTo);
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData?.notVerified) {
                navigate('/verify-otp', { state: { email: formData.email } });
                return;
            }
            setError(responseData?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <Link to="/" className="back-home-btn">
                <ArrowLeft size={16} /> Back to Store
            </Link>

            <div className="auth-graphic-panel">
                <div className="graphic-overlay"></div>
                <div className="graphic-content">
                    <div className="graphic-logo">makskin</div>
                    <div className="promo-pill">Premium Skincare</div>
                    <div className="graphic-text">
                        <h1>Discover Your True Radiance</h1>
                        <p>100% authentic cosmetics and clean skincare products tailored for your unique beauty journey.</p>
                    </div>
                </div>
                <div className="graphic-footer">© 2026 Makskin Cosmetics. All rights reserved.</div>
            </div>

            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {successMessage && (
                        <div className="success-msg" style={{
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            color: '#15803d',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}>
                            {successMessage}
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
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modern-form-group">
                            <div className="label-row">
                                <label htmlFor="password">Password</label>
                                <Link to="/forgotpassword" className="forgot-pass-link">Forgot?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="modern-auth-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="form-footer">
                        <span>Don't have an account? <Link to="/signup">Create account</Link></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
