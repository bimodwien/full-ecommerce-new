import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { TCartStoreState } from '@/models/cart.model';

const initialState: TCartStoreState = {
  count: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    incrementCartCount: (state) => {
      state.count += 1;
    },
    decrementCartCount: (state) => {
      state.count = Math.max(0, state.count - 1);
    },
    decrementCartCountBy: (state, action: PayloadAction<number>) => {
      state.count = Math.max(0, state.count - action.payload);
    },
    clearCart: () => initialState,
  },
});

export const {
  setCartCount,
  incrementCartCount,
  decrementCartCount,
  decrementCartCountBy,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
