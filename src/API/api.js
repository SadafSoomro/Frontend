import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = axios.create({
    baseURL: API_BASE_URL,
});

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
