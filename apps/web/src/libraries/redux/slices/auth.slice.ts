import { TUser, Role } from '@/models/user.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { deleteCookie } from 'cookies-next';

export type TAuthState = TUser & {
  // Becomes true once AuthProvider has checked the cookie on mount, whether
  // or not a session was found. Pages must wait for this before treating
  // an empty `id` as "not logged in" — otherwise they redirect on the
  // first render, before the cookie has been read.
  initialized: boolean;
};

const initialUser: TAuthState = {
  id: '',
  name: '',
  email: '',
  username: '',
  password: '',
  initialized: false,
};

export const userSlice = createSlice({
  name: 'auth',
  initialState: initialUser,
  reducers: {
    login: (state, action: PayloadAction<TUser>) => {
      return {
        ...state,
        id: action.payload.id || 'NO_ID',
        name: action.payload.name || 'NO_NAME',
        email: action.payload.email || 'NO_EMAIL',
        username: action.payload.username || 'NO_USERNAME',
        password: action.payload.password || 'NO_PASSWORD',
        // ensure role conforms to Role union
        role: action.payload.role as Role,
        initialized: true,
      };
    },

    authChecked: (state) => {
      state.initialized = true;
    },

    logout: (state) => {
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      state.id = '';
      state.name = '';
      state.email = '';
      state.username = '';
      state.password = '';
      state.role = undefined;
      state.initialized = true;
    },
  },
});

export const { login, logout, authChecked } = userSlice.actions;
export default userSlice.reducer;
