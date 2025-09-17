'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { keepLogin } from '@/libraries/redux/middlewares/auth.middleware';

type Props = { children: React.ReactNode };

const AuthProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      await dispatch(keepLogin());
    };
    initAuth();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
