"use client";

import React, { useState } from 'react';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { logout } from '@/libraries/redux/slices/auth.slice';
import { Button } from './ui/button';

interface LogoutButtonProps {
  redirectTo?: string;
  className?: string;
  label?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  redirectTo = '/login',
  className = '',
  label = 'Logout',
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      dispatch(logout());
      // Hard redirect to clear any client state quickly
      window.location.href = redirectTo;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`bg-red-500 hover:bg-red-600 text-white ${className}`}
    >
      {loading ? 'Logging out...' : label}
    </Button>
  );
};

export default LogoutButton;
