'use client';
import React from 'react';
import { formatIDR } from '@/lib/utils';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { toast } from 'sonner';
import { deleteProduct } from '@/helpers/fetch-product';
import { TProductList } from '@/models/product.model';

interface ProductTableProps {
  products: TProductList[];
  onDeleteSuccess?: (id: string) => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'IN_STOCK':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          In Stock
        </Badge>
      );
    case 'LOW_STOCK':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Low Stock
        </Badge>
      );
    case 'OUT_OF_STOCK':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Out of Stock
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
const ProductTable = ({ products, onDeleteSuccess }: ProductTableProps) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [selected, setSelected] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const promptDelete = (id: string, name: string) => {
    setSelected({ id, name });
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

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden text-zinc-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Product Name</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const apiBase = (
                process.env.NEXT_PUBLIC_BASE_API_URL ||
                'http://localhost:8000/api'
              ).replace(/\/$/, '');
              const imageUrl = `${apiBase}/products/image/${product.id}`;
              const category = product.Category?.name || 'Uncategorized';
              const stock = product.stockTotal ?? 0;
              const status = product.stockStatus || 'IN_STOCK';
              const price = Number(product.price ?? 0);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        className="w-10 h-10 sm:w-15 sm:h-15 rounded-lg object-cover flex-shrink-0"
                        width={60}
                        height={60}
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-zinc-700 text-sm sm:text-base block truncate">
                          {product.name}
                        </span>
                        <span className="text-xs text-zinc-500 sm:hidden block">
                          {category}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-700 first-letter:capitalize hidden sm:table-cell">
                    {category}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-zinc-700">
                      {stock}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-700 hidden md:table-cell">
                    {formatIDR(price)}
                  </TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/products/edit/${product.id}`,
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => promptDelete(product.id, product.name)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Delete confirmation dialog */}
      <AlertDialog
        open={dialogOpen}
        onOpenChange={(o) => !pending && setDialogOpen(o)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              {selected ? ` "${selected.name}"` : ' this product'} and remove
              its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={pending}
            >
              {pending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductTable;
