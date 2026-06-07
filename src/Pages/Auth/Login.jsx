import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <Link to="/" className="back-home-btn">
                <ArrowLeft size={16} /> Back to Store
            </Link>

            {/* Left Column (Aesthetic Graphic Panel) */}
            <div className="auth-graphic-panel">
                <div className="graphic-overlay" />
                <div className="graphic-content">
                    <div className="graphic-logo">
                        <span className="logo-box">makskin</span>
                    </div>
                    <div className="graphic-text">
                        <div className="promo-pill">
                            <Sparkles size={14} className="sparkle-icon" />
                            <span>100% Organic Formulations</span>
                        </div>
                        <h1>Reveal Your Natural Glow</h1>
                        <p>Join a community of skincare lovers. Log in to manage your personalized routines, orders, and exclusive rewards.</p>
                    </div>
                    <div className="graphic-footer">
                        <span>Guaranteed Authentic Products • Secure Checkout</span>
                    </div>
                </div>
            </div>

            {/* Right Column (Minimalist Form Panel) */}
            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
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
