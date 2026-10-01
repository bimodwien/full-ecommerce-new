import { axiosInstance } from '@/libraries/axios';

export const subscribeNewsletter = async (email: string): Promise<void> => {
  await axiosInstance().post('/newsletter/subscribe', { email });
};
