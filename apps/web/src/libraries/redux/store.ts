import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/auth.slice';
import wishlistReducer from './slices/wishlist.slice';
import cartReducer from './slices/cart.slice';

const reducer = combineReducers({
  auth: userReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
});

export const makeStore = () => {
  return configureStore({
    reducer,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
