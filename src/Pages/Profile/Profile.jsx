import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock } from 'lucide-react';
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
            <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: isStoreProfile ? '100vh' : 'auto', 
            background: isStoreProfile ? 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)' : 'transparent', 
            padding: isStoreProfile ? '2rem' : '0',
            display: isStoreProfile ? 'flex' : 'block',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {isStoreProfile && (
                <div style={{ width: '100%', maxWidth: '480px', marginBottom: '1.5rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                        <ArrowLeft size={16} /> Back to Store
                    </Link>
                </div>
            )}

            <div style={{ width: '100%', maxWidth: '480px', background: isStoreProfile ? 'rgba(30, 30, 48, 0.6)' : 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: isStoreProfile ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--glass-border)', padding: '2.5rem', borderRadius: '20px', boxShadow: isStoreProfile ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.05)' }}>

                {/* Header with Icon */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${isStoreProfile ? 'rgba(255, 255, 255, 0.1)' : 'var(--glass-border)'}` }}>
                    <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        background: isStoreProfile ? 'rgba(226, 27, 38, 0.15)' : 'rgba(226, 27, 38, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${isStoreProfile ? 'rgba(226, 27, 38, 0.25)' : 'rgba(226, 27, 38, 0.15)'}`
                    }}>
                        <User size={24} style={{ color: 'var(--accent-primary, #e21b26)' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: isStoreProfile ? '#fff' : 'var(--text-primary)', margin: 0, marginBottom: '2px' }}>Edit Profile</h2>
                        <p style={{ fontSize: '0.82rem', color: isStoreProfile ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-secondary)', margin: 0 }}>Manage your account settings</p>
                    </div>
                </div>

                {message && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#81c784',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ff8a80',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Name Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: isStoreProfile ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)', marginBottom: '6px' }}>
                            <User size={14} /> Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: isStoreProfile ? 'rgba(255, 255, 255, 0.05)' : 'var(--card-bg)',
                                border: isStoreProfile ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: isStoreProfile ? '#fff' : 'var(--text-primary)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                if (isStoreProfile) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.borderColor = 'rgba(226, 27, 38, 0.5)';
                                }
                            }}
                            onBlur={(e) => {
                                if (isStoreProfile) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                        />
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: isStoreProfile ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)', marginBottom: '6px' }}>
                            <Mail size={14} /> Email Address
                            <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(cannot be changed)</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            readOnly
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: isStoreProfile ? 'rgba(255, 255, 255, 0.03)' : 'var(--glass-bg)',
                                border: isStoreProfile ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: isStoreProfile ? 'rgba(255, 255, 255, 0.5)' : 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                opacity: 0.7,
                                cursor: 'not-allowed'
                            }}
                        />
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: isStoreProfile ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)', marginBottom: '6px' }}>
                            <Phone size={14} /> Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: isStoreProfile ? 'rgba(255, 255, 255, 0.05)' : 'var(--card-bg)',
                                border: isStoreProfile ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: isStoreProfile ? '#fff' : 'var(--text-primary)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                if (isStoreProfile) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.borderColor = 'rgba(226, 27, 38, 0.5)';
                                }
                            }}
                            onBlur={(e) => {
                                if (isStoreProfile) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: isStoreProfile ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)', marginBottom: '6px' }}>
                            <Lock size={14} /> New Password
                            <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(leave blank to keep)</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: isStoreProfile ? 'rgba(255, 255, 255, 0.05)' : 'var(--card-bg)',
                                border: isStoreProfile ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: isStoreProfile ? '#fff' : 'var(--text-primary)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                if (isStoreProfile) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.borderColor = 'rgba(226, 27, 38, 0.5)';
                                }
                            }}
                            onBlur={(e) => {
                                if (isStoreProfile) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '12px',
                            background: 'var(--accent-primary, #e21b26)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { if (!loading) e.target.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { if (!loading) e.target.style.transform = 'translateY(0)'; }}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
