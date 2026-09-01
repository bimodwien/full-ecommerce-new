import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type WishlistEntry = {
  id: string; // wishlist row id
  productId: string;
  variantId: string | null;
};

type WishlistState = {
  items: WishlistEntry[]; // most-recent first
  productIds: string[]; // derived from items, kept for convenient lookups
  count: number;
};

const initialState: WishlistState = {
  items: [],
  productIds: [],
  count: 0,
};

function deriveProductIds(items: WishlistEntry[]): string[] {
  return Array.from(new Set(items.map((i) => i.productId)));
}

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<{ items: WishlistEntry[] }>) => {
      state.items = action.payload.items;
      state.productIds = deriveProductIds(state.items);
      state.count = state.items.length;
    },
    addWishlistEntry: (state, action: PayloadAction<WishlistEntry>) => {
      if (!state.items.some((i) => i.id === action.payload.id)) {
        state.items.unshift(action.payload);
      }
      state.productIds = deriveProductIds(state.items);
      state.count = state.items.length;
    },
    removeWishlistEntry: (
      state,
      action: PayloadAction<{
        id?: string;
        productId: string;
        variantId?: string | null;
      }>,
    ) => {
      const { id, productId, variantId } = action.payload;
      state.items = state.items.filter((i) =>
        id
          ? i.id !== id
          : !(
              i.productId === productId &&
              (i.variantId ?? null) === (variantId ?? null)
            ),
      );
      state.productIds = deriveProductIds(state.items);
      state.count = state.items.length;
    },
    removeWishlistEntriesForProduct: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      state.productIds = deriveProductIds(state.items);
      state.count = state.items.length;
    },
    clearWishlist: () => initialState,
  },
});

export const {
  setWishlist,
  addWishlistEntry,
  removeWishlistEntry,
  removeWishlistEntriesForProduct,
  clearWishlist,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
