import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import { getProfileApi, updateProfileApi } from '../../API/api';
import { useAuth } from '../../context/AuthContext';
import '../Auth/Auth.css';

const Profile = () => {
    const location = useLocation();
    const isStoreProfile = location.pathname === '/profile';
    const { updateUser, user: authUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getProfileApi();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    password: ''
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        if (e.target.name === 'email') return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            const { data } = await updateProfileApi(payload);
            updateUser(data);
            setFormData((prev) => ({ ...prev, password: '' }));
            setMessage('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="centered-loader-wrapper" style={{ minHeight: '70vh' }}>
                <Loader2 className="global-loading-spinner" size={64} />
                <p className="centered-loader-text" style={{ fontSize: '1.1rem' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className={isStoreProfile ? "auth-split-layout" : ""} style={{ minHeight: isStoreProfile ? '100vh' : 'auto', padding: isStoreProfile ? '20px' : '0' }}>
            {isStoreProfile && (
                <Link to="/" className="back-home-btn">
                    <ArrowLeft size={16} /> Back to Store
                </Link>
            )}

            <div className={isStoreProfile ? "auth-form-panel" : ""} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className="form-container" style={{ margin: isStoreProfile ? '0' : '0 auto', maxWidth: '480px' }}>
                    <div className="form-header" style={{ alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '12px',
                            background: 'rgba(226, 27, 38, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(226, 27, 38, 0.25)',
                            margin: '0 auto 10px'
                        }}>
                            <User size={24} style={{ color: 'var(--accent-primary, #e21b26)' }} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem' }}>Edit Profile</h2>
                        <p>Manage your account settings</p>
                    </div>

                    {message && (
                        <div className="error-msg" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.4)', color: '#81c784' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{message}</span>
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
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modern-form-group">
                            <div className="label-row">
                                <label htmlFor="email">Email Address</label>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>(cannot be changed)</span>
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                readOnly
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="modern-form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modern-form-group">
                            <div className="label-row">
                                <label htmlFor="password">New Password</label>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>(leave blank to keep)</span>
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="modern-auth-btn" disabled={loading} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? (
                                <>
                                    <Loader2 className="global-loading-spinner" size={16} />
                                    Updating...
                                </>
                            ) : (
                                'Update Profile'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
