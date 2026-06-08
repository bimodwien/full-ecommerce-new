'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { keepLogin } from '@/libraries/redux/middlewares/auth.middleware';
import {
  setWishlist,
  clearWishlist,
} from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount, clearCart } from '@/libraries/redux/slices/cart.slice';
import { fetchWishlists } from '@/helpers/fetch-wishlist';
import { fetchCartCount } from '@/helpers/fetch-cart';

type Props = { children: React.ReactNode };

const AuthProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const authId = useAppSelector((s) => s.auth.id);

  useEffect(() => {
    dispatch(keepLogin());
  }, [dispatch]);

  // Setiap kali auth berubah: isi atau kosongkan state wishlist & cart
  useEffect(() => {
    if (!authId) {
      dispatch(clearWishlist());
      dispatch(clearCart());
      return;
    }
    fetchWishlists({ limit: 500 })
      .then((items) => {
        dispatch(
          setWishlist({
            productIds: items.map((w) => w.productId),
            count: items.length,
          }),
        );
      })
      .catch(() => {});
    fetchCartCount()
      .then((count) => dispatch(setCartCount(count)))
      .catch(() => {});
  }, [authId, dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
