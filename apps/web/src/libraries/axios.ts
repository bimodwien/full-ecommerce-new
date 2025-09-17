import axios, { AxiosInstance } from 'axios';
import { getCookie } from 'cookies-next';

export function axiosInstance(): AxiosInstance {
  const token = getCookie('access_token') as string | undefined;
  return axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
}
