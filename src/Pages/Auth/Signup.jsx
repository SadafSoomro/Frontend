import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../API/api';
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
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

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            await registerApi({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
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
                    <div className="promo-pill">Join the Family</div>
                    <div className="graphic-text">
                        <h1>Unlock Exclusive Benefits</h1>
                        <p>Create an account to track orders, save your favorite items, and receive personalized skincare advice.</p>
                    </div>
                </div>
                <div className="graphic-footer">© 2026 Makskin Cosmetics. All rights reserved.</div>
            </div>

            <div className="auth-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2>Create Account</h2>
                        <p>Join us to start your skincare journey</p>
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
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modern-form-group">
                            <label htmlFor="password">Password</label>
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

                        <div className="modern-form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="modern-auth-btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? (
                                <>
                                    <Loader2 className="global-loading-spinner" size={16} />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="form-footer">
                        <span>Already have an account? <Link to="/login">Sign in</Link></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
