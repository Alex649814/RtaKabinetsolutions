import { createSlice } from '@reduxjs/toolkit';

const estimateSlice = createSlice({
  name: 'estimate',
  initialState: {
    items: [] // Aquí se almacenan los productos añadidos al presupuesto
  },
  reducers: {
    // Añadir un producto al presupuesto
    addToEstimate: (state, action) => {
      const product = action.payload;
      const existing = state.items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },

    // Eliminar un producto del presupuesto
    removeFromEstimate: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
    },

    // Actualizar la cantidad de un producto en el presupuesto
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },

        updatePrice: (state, action) => {
      const { id, price } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.price = price;
      }
    },

    // Limpiar completamente el presupuesto
    clearEstimate: (state) => {
      state.items = [];
    }
  }
});

// Exportar las acciones para usarlas en los componentes
export const {
  addToEstimate,
  removeFromEstimate,
  updateQuantity,
  updatePrice,
  clearEstimate
} = estimateSlice.actions;

// Exportar el reducer para conectarlo al store
export default estimateSlice.reducer;
