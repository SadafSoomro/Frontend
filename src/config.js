export const API_BASE_URL = 'http://localhost:5000';
// import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const assetUrl = (path) =>
    path?.startsWith('http') ? path : `${API_BASE_URL}/${path}`;
