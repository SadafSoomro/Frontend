import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../../API/api';

// Async Thunks
export const getProducts = createAsyncThunk('products/getProducts', async (_, { rejectWithValue }) => {
    try {
        const response = await fetchProductsApi();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
});

export const createProduct = createAsyncThunk('products/createProduct', async (formData, { rejectWithValue }) => {
    try {
        const response = await createProductApi(formData);
        return response.data.product;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to create product' });
    }
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await updateProductApi(id, formData);
        return response.data.product;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to update product' });
    }
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
    try {
        await deleteProductApi(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to delete product' });
    }
});

const productSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        loading: false,
        error: null,
        submitting: false,
    },
    reducers: {
        clearProductError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Products
            .addCase(getProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.submitting = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.submitting = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message;
            })
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.submitting = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.submitting = false;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message;
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            });
    }
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
