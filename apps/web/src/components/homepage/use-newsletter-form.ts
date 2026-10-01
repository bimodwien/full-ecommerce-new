import React, { useState } from 'react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { subscribeNewsletter } from '@/helpers/fetch-newsletter';

// Shared by the hero and the newsletter banner: both are the same
// "enter email, get a reply" form.
export function useNewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || loading) return;
    setLoading(true);
    try {
      await subscribeNewsletter(value);
      toast.success('Thanks for subscribing! Check your inbox.');
      setEmail('');
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : '';
      toast.error(message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, handleSubmit };
}
