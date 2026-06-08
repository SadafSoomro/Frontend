import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfileApi } from '../API/api';
import { store } from '../Store/Store';
import { clearCart } from '../Store/Slices/CartSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const login = useCallback((userData) => {
        const { token: newToken, ...userInfo } = userData;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cartItems');
        store.dispatch(clearCart());
        setToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((userData) => {
        const merged = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(merged));
        if (userData.token) {
            localStorage.setItem('token', userData.token);
            setToken(userData.token);
        }
        setUser(merged);
    }, [user]);

    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await getProfileApi();
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                const freshUser = { ...stored, ...data, token };
                localStorage.setItem('user', JSON.stringify(freshUser));
                setUser(freshUser);
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
