export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const STRIPE_PUBLISHABLE_KEY =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_stripepublishable_key ||
    '';

export const assetUrl = (path) =>
    path?.startsWith('http') ? path : `${API_BASE_URL}/${path}`;
