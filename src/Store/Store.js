import { configureStore } from '@reduxjs/toolkit';
import bannerReducer from './Slices/BannerSlice';
import categoryReducer from './Slices/CategorySlice';
import productReducer from './Slices/ProductSlice';
import cartReducer from './Slices/CartSlice';

export const store = configureStore({
    reducer: {
        banners: bannerReducer,
        categories: categoryReducer,
        products: productReducer,
        cart: cartReducer,
    },
});

export default store;
