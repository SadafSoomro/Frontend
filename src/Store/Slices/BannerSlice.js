import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchBannersApi, createBannerApi, updateBannerApi, deleteBannerApi } from '../../API/api';

// Async Thunks
export const getBanners = createAsyncThunk('banners/getBanners', async (_, { rejectWithValue }) => {
    try {
        const response = await fetchBannersApi();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const createBanner = createAsyncThunk('banners/createBanner', async (formData, { rejectWithValue }) => {
    try {
        const response = await createBannerApi(formData);
        return response.data.banner;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateBanner = createAsyncThunk('banners/updateBanner', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await updateBannerApi(id, formData);
        return response.data.banner;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const deleteBanner = createAsyncThunk('banners/deleteBanner', async (id, { rejectWithValue }) => {
    try {
        await deleteBannerApi(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const bannerSlice = createSlice({
    name: 'banners',
    initialState: {
        banners: [],
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
            // Get Banners
            .addCase(getBanners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload;
            })
            .addCase(getBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch banners';
            })
            // Create Banner
            .addCase(createBanner.pending, (state) => {
                state.submitting = true;
            })
            .addCase(createBanner.fulfilled, (state, action) => {
                state.submitting = false;
                state.banners.push(action.payload);
            })
            .addCase(createBanner.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message || 'Failed to create banner';
            })
            // Update Banner
            .addCase(updateBanner.pending, (state) => {
                state.submitting = true;
            })
            .addCase(updateBanner.fulfilled, (state, action) => {
                state.submitting = false;
                const index = state.banners.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.banners[index] = action.payload;
                }
            })
            .addCase(updateBanner.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message || 'Failed to update banner';
            })
            // Delete Banner
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter(b => b._id !== action.payload);
            });
    }
});

export const { clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
