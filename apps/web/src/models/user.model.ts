export type Role = 'buyer' | 'seller';

export type TUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  // Role can be absent in logged-out UI state
  role?: Role;
  googleId?: string | null;
  // Frontend should never persist password; keep optional for forms only
  password?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TAuthState = TUser & {
  // Becomes true once AuthProvider has checked the cookie on mount, whether
  // or not a session was found. Pages must wait for this before treating
  // an empty `id` as "not logged in" — otherwise they redirect on the
  // first render, before the cookie has been read.
  initialized: boolean;
};

// Body sent to POST /users/register.
export type TRegisterPayload = Pick<
  TUser,
  'name' | 'username' | 'email' | 'password'
> & {
  role: Role;
};
