import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

export function useAddProductImages() {
  const [files, setFiles] = useState<File[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const next = [...files, ...selected];
    if (next.length > 5) {
      toast.error('Maximum 5 images allowed');
    }
    setFiles(next.slice(0, 5));
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return { files, imageRef, handleImageUpload, removeImage };
}

export type AddProductImages = ReturnType<typeof useAddProductImages>;
