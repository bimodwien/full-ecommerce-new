export type Role = 'buyer' | 'seller';

export type TUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  googleId?: string | null;
  // Frontend should never persist password; keep optional for forms only
  password?: string;
  createdAt?: string;
  updatedAt?: string;
};
