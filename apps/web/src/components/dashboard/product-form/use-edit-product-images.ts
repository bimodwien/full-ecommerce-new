import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { TProductImage } from '@/models/product.model';

// Keeps only as many picked files as there are free slots, warning otherwise.
function acceptFiles(picked: File[], slotsLeft: number): File[] {
  if (slotsLeft <= 0) {
    toast.error('You already have the maximum of 5 images');
    return [];
  }
  const accepted = picked.slice(0, slotsLeft);
  if (picked.length > accepted.length) {
    toast.error(
      `Only ${slotsLeft} more image${slotsLeft > 1 ? 's' : ''} can be added`,
    );
  }
  return accepted;
}

const toggleId = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];

export function useEditProductImages() {
  const [serverImages, setServerImages] = useState<TProductImage[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  const remainingExisting = serverImages.filter(
    (img) => !removeImageIds.includes(img.id),
  );
  const totalEffectiveCount = remainingExisting.length + newFiles.length;
  const slotsLeft = Math.max(0, 5 - totalEffectiveCount);

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    const accepted = acceptFiles(picked, slotsLeft);
    if (accepted.length === 0) return;
    setNewFiles((prev) => [...prev, ...accepted]);
    // clear input value so same files can be picked again if removed
    if (imageRef.current) imageRef.current.value = '';
  };

  const removeNewFile = (index: number) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  const toggleRemoveServerImage = (imgId: string) =>
    setRemoveImageIds((prev) => toggleId(prev, imgId));

  return {
    serverImages,
    setServerImages,
    removeImageIds,
    newFiles,
    imageRef,
    totalEffectiveCount,
    slotsLeft,
    handleNewFiles,
    removeNewFile,
    toggleRemoveServerImage,
  };
}

export type EditProductImages = ReturnType<typeof useEditProductImages>;
