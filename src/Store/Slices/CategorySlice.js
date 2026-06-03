import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../../API/api';

// Async Thunks
export const getCategories = createAsyncThunk('categories/getCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await fetchCategoriesApi();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const createCategory = createAsyncThunk('categories/createCategory', async (formData, { rejectWithValue }) => {
    try {
        const response = await createCategoryApi(formData);
        return response.data.category;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await updateCategoryApi(id, formData);
        return response.data.category;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (id, { rejectWithValue }) => {
    try {
        await deleteCategoryApi(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [],
        loading: false,
        error: null,
        submitting: false,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Categories
            .addCase(getCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch categories';
            })
            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.submitting = true;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.submitting = false;
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message || 'Failed to create category';
            })
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.submitting = true;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.submitting = false;
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message || 'Failed to update category';
            })
            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
            });
    }
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
