import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = axios.create({
    baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (userData) => API.post('/auth/register', userData);
export const verifyOtpApi = (data) => API.post('/auth/verify-otp', data);
export const resendOtpApi = (email) => API.post('/auth/resend-otp', { email });
export const getProfileApi = () => API.get('/auth/profile');
export const updateProfileApi = (data) => API.put('/auth/updateprofile', data);
export const forgotPasswordApi = (email) => API.post('/auth/forgotpassword', { email });
export const resetPasswordApi = (data) => API.put('/auth/resetpassword', data);
export const getAllUsersApi = () => API.get('/auth/users');
export const updateUserApi = (id, data) => API.put(`/auth/users/${id}`, data);
export const deleteUserApi = (id) => API.delete(`/auth/users/${id}`);
export const sendOrderConfirmationApi = (data) => API.post('/auth/order-confirmation', data);

// Coupon APIs
export const validateCouponApi = (code) => API.post('/coupons/validate', { code });
export const fetchAllCouponsApi = () => API.get('/coupons');
export const createCouponApi = (data) => API.post('/coupons', data);
export const updateCouponApi = (id, data) => API.put(`/coupons/${id}`, data);
export const deleteCouponApi = (id) => API.delete(`/coupons/${id}`);

// Order APIs
export const createOrderApi = (data) => API.post('/orders', data);
export const fetchAllOrdersApi = () => API.get('/orders');
export const updateOrderStatusApi = (id, status) => API.put(`/orders/${id}`, { status });
export const deleteOrderApi = (id) => API.delete(`/orders/${id}`);

// Banner APIs
export const fetchBannersApi = () => API.get('/banners/get');
export const createBannerApi = (formData) => API.post('/banners/post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateBannerApi = (id, formData) => API.put(`/banners/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteBannerApi = (id) => API.delete(`/banners/delete/${id}`);

// Category APIs
export const fetchCategoriesApi = () => API.get('/categories/get');
export const createCategoryApi = (formData) => API.post('/categories/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateCategoryApi = (id, formData) => API.put(`/categories/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteCategoryApi = (id) => API.delete(`/categories/delete/${id}`);

// Product APIs
export const fetchProductsApi = () => API.get('/products/get');
export const createProductApi = (formData) => API.post('/products/post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProductApi = (id, formData) => API.put(`/products/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProductApi = (id) => API.delete(`/products/delete/${id}`);

export default API;
