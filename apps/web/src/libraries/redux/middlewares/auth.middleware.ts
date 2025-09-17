import { Dispatch } from 'redux';
import { axiosInstance } from '@/libraries/axios';
import { login } from '../slices/auth.slice';
import { TUser } from '@/models/user.model';
import { getCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

export const userLogin = ({ username, password }: TUser) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await axiosInstance().post(
        '/users/login',
        { username, password },
        { withCredentials: true },
      );
      const access_token = getCookie('access_token') || '';
      if (typeof access_token === 'string') {
        const decoded = jwtDecode<{ user: TUser }>(access_token);
        if (!decoded.user) {
          throw new Error('Invalid token data');
        }
        const userData = decoded.user;
        dispatch(login(userData));
        return { success: true, user: userData };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Login failed: ', error);
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      throw error;
    }
  };
};

export const keepLogin = () => async (dispatch: Dispatch) => {
  try {
    const token = getCookie('access_token');
    if (typeof token === 'string' && token.trim() !== '') {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const decode = jwtDecode<{ user: TUser }>(token);
      if (decode && decode.user) {
        dispatch(login(decode.user));
      } else {
        throw new Error('Invalid token payload');
      }
    }
  } catch (error) {
    console.error('Keep login failed: ', error);
    deleteCookie('access_token');
    deleteCookie('refresh_token');
  }
};
