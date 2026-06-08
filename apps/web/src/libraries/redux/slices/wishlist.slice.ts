import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type WishlistState = {
  productIds: string[]; // IDs produk yang sudah di-wishlist
  count: number;
};

const initialState: WishlistState = {
  productIds: [],
  count: 0,
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (
      state,
      action: PayloadAction<{ productIds: string[]; count: number }>,
    ) => {
      state.productIds = action.payload.productIds;
      state.count = action.payload.count;
    },
    addWishlistProduct: (state, action: PayloadAction<string>) => {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload);
        state.count += 1;
      }
    },
    removeWishlistProduct: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
      state.count = Math.max(0, state.count - 1);
    },
    clearWishlist: () => initialState,
  },
});

export const {
  setWishlist,
  addWishlistProduct,
  removeWishlistProduct,
  clearWishlist,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
