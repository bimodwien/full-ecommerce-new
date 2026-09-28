import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteProduct } from '@/helpers/fetch-product';

type Target = { id: string; name: string };

export function useDeleteProduct(onDeleteSuccess?: (id: string) => void) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<Target | null>(null);

  const promptDelete = (target: Target) => {
    setSelected(target);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setPending(true);
    try {
      await toast.promise(deleteProduct(selected.id), {
        loading: 'Deleting product…',
        success: () => 'Product deleted',
        error: (err) =>
          (err as any)?.response?.data?.message || 'Failed to delete product',
      });
      onDeleteSuccess?.(selected.id);
      setDialogOpen(false);
      setSelected(null);
    } finally {
      setPending(false);
    }
  };

  return {
    dialogOpen,
    setDialogOpen,
    pending,
    selected,
    promptDelete,
    confirmDelete,
  };
}

type DialogProps = { state: ReturnType<typeof useDeleteProduct> };

export default function DeleteProductDialog({ state }: DialogProps) {
  const { dialogOpen, pending, selected } = state;
  return (
    <AlertDialog
      open={dialogOpen}
      onOpenChange={(o) => !pending && state.setDialogOpen(o)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            {selected ? ` "${selected.name}"` : ' this product'} and remove its
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={state.confirmDelete}
            disabled={pending}
          >
            {pending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
