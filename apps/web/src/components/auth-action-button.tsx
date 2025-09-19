'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';
import { Button } from './ui/button';

const AuthActionButton: React.FC = () => {
  const auth = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const isLoggedIn = Boolean(auth?.id && auth.id !== '');

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  if (!isLoggedIn) {
    return (
      <Button
        type="button"
        onClick={() => (window.location.href = '/login')}
        className="bg-[#15AD39] hover:bg-[#15AD39]/90 text-white"
      >
        Login
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white"
    >
      Logout
    </Button>
  );
};

export default AuthActionButton;
