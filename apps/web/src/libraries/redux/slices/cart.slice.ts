import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type CartState = {
  count: number;
};

const initialState: CartState = {
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
    clearCart: () => initialState,
  },
});

export const {
  setCartCount,
  incrementCartCount,
  decrementCartCount,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
