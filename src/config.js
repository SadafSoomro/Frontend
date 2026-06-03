export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'https://skin-care-backend-livid.vercel.app';

export const assetUrl = (path) =>
    path?.startsWith('http') ? path : `${API_BASE_URL}/${path}`;
