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

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: string;
  price: number;
  image: string;
}

interface ProductTableProps {
  products: Product[];
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Image
                      src={`http://localhost:8000/api/products/image/${product.id}`}
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
                        {product.category}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-700 first-letter:capitalize hidden sm:table-cell">
                  {product.category}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm text-zinc-700">
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-zinc-700 hidden md:table-cell">
                  {formatIDR(product.price)}
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                          router.push(`/dashboard/products/edit/${product.id}`)
                        }
                      >
                        <Edit className="w-4 h-4 mr-2 text-zinc-700" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => promptDelete(product.id, product.name)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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
