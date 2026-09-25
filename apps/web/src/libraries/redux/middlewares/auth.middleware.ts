import { Dispatch } from 'redux';
import { axiosInstance } from '@/libraries/axios';
import { login, authChecked } from '../slices/auth.slice';
import { TUser, Role } from '@/models/user.model';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

// Store the tokens on the web app's own domain. The API's Set-Cookie only
// works while web and API share a host (localhost, or one domain behind a
// reverse proxy). On separate domains the browser files that cookie under
// the API's domain, where neither getCookie nor proxy.ts can see it.
const saveSession = (data: {
  access_token?: string;
  refresh_token?: string;
}) => {
  if (!data?.access_token) throw new Error('No access token returned');
  setCookie('access_token', data.access_token);
  if (data.refresh_token) setCookie('refresh_token', data.refresh_token);

  const decoded = jwtDecode<{ user: TUser }>(data.access_token);
  if (!decoded.user) throw new Error('Invalid token data');
  return decoded.user;
};

export const userLogin = ({
  username,
  password,
}: Pick<TUser, 'username' | 'password'>) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await axiosInstance().post(
        '/users/login',
        { username, password },
        { withCredentials: true },
      );
      const userData = saveSession(response.data);
      dispatch(login(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed: ', error);
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      throw error;
    }
  };
};

export const googleLogin = (id_token: string) => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await axiosInstance().post(
        '/users/google',
        { id_token },
        { withCredentials: true },
      );
      const userData = saveSession(response.data);
      dispatch(login(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login failed: ', error);
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
    } else {
      dispatch(authChecked());
    }
  } catch (error) {
    console.error('Keep login failed: ', error);
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    dispatch(authChecked());
  }
};

// --- Registration thunk ---
type TRegisterPayload = Pick<
  TUser,
  'name' | 'username' | 'email' | 'password'
> & {
  role: Role;
};

export const userRegister = (payload: TRegisterPayload) => {
  return async (_dispatch: Dispatch) => {
    try {
      const response = await axiosInstance().post('/users/register', payload, {
        withCredentials: true,
      });
      return { success: true, user: response.data?.user };
    } catch (error) {
      console.error('Register failed: ', error);
      throw error;
    }
  };
};
