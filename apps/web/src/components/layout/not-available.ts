import type React from 'react';
import { toast } from 'sonner';

// Placeholder links/buttons that don't lead anywhere yet.
export const handleNotAvailable = (e: React.MouseEvent) => {
  e.preventDefault();
  toast.info('In development stage');
};
