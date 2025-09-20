import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice';
import estimateReducer from '../features/Estimate/estimateSlice';
import productVariantsReducer from '../features/productVariants/productVariantsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    estimate: estimateReducer,
    productVariants: productVariantsReducer 
  }
});