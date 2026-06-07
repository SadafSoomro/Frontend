import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage if exists
const loadCartFromStorage = () => {
    try {
        const storedCart = localStorage.getItem('cartItems');
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error('Failed to load cart from storage', e);
        return [];
    }
};

const saveCartToStorage = (items) => {
    try {
        localStorage.setItem('cartItems', JSON.stringify(items));
    } catch (e) {
        console.error('Failed to save cart to storage', e);
    }
};

const initialState = {
    items: loadCartFromStorage(),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existingItem = state.items.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...product, quantity: 1 });
            }
            saveCartToStorage(state.items);
        },
        removeFromCart: (state, action) => {
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id);
            saveCartToStorage(state.items);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find(item => item.id === id);
            if (existingItem && quantity > 0) {
                existingItem.quantity = quantity;
            }
            saveCartToStorage(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            saveCartToStorage([]);
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
