import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../lib/api'; // 👈 Importamos API_URL

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      return res.data;
    } catch (err) {
      console.error("Error fetching products:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    // Aquí puedes añadir otras acciones como agregar al presupuesto, etc.
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export default productsSlice.reducer;
