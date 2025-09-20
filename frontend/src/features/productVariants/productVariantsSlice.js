import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../lib/api'; // 👈 Importamos API_URL

// Thunk para traer variantes de producto
export const fetchProductVariants = createAsyncThunk(
  'productVariants/fetchProductVariants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/product-variants/admin/all`);
      return response.data;
    } catch (err) {
      console.error("Error fetching product variants:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const productVariantsSlice = createSlice({
  name: 'productVariants',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProductVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default productVariantsSlice.reducer;