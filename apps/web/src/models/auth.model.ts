// Basic shape of user inside JWT (adjust if backend changes)
export interface JwtUser {
  id: string;
  role: 'buyer' | 'seller' | string;
  username?: string;
  email?: string;
}
export interface AccessTokenPayload {
  user?: JwtUser;
  type?: string;
  exp?: number;
  iat?: number;
}
