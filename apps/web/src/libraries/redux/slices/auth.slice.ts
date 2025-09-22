import { TUser, Role } from '@/models/user.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { deleteCookie } from 'cookies-next';

const initialUser: TUser = {
  id: '',
  name: '',
  email: '',
  username: '',
  password: '',
};

export const userSlice = createSlice({
  name: 'auth',
  initialState: initialUser as TUser,
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
      };
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
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
