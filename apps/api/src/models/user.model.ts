import { Role } from '@prisma/client';

export interface TUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  googleId?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type TDecode = {
  type: string;
  user: TUser;
};
