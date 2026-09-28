import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { listImageUrl } from '@/lib/product-display';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TProductList } from '@/models/product.model';

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  IN_STOCK: {
    label: 'In Stock',
    className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  },
  LOW_STOCK: {
    label: 'Low Stock',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status];
  if (!badge) return <Badge variant="secondary">{status}</Badge>;
  return <Badge className={badge.className}>{badge.label}</Badge>;
}

type ActionsProps = { productId: string; onDelete: () => void };

function RowActions({ productId, onDelete }: ActionsProps) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/products/edit/${productId}`)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="flex items-center gap-2 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type NameCellProps = { product: TProductList; category: string };

function ProductNameCell({ product, category }: NameCellProps) {
  return (
    <TableCell>
      <div className="flex items-center space-x-3">
        <Image
          src={listImageUrl(product, product.id)}
          alt={product.name}
          className="w-10 h-10 sm:w-15 sm:h-15 rounded-lg object-cover shrink-0"
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
  );
}

type RowProps = { product: TProductList; onDelete: () => void };

export default function ProductRow({ product, onDelete }: RowProps) {
  const category = product.Category?.name || 'Uncategorized';
  return (
    <TableRow>
      <ProductNameCell product={product} category={category} />
      <TableCell className="text-zinc-700 first-letter:capitalize hidden sm:table-cell">
        {category}
      </TableCell>
      <TableCell>
        <span className="font-medium text-sm text-zinc-700">
          {product.stockTotal ?? 0}
        </span>
      </TableCell>
      <TableCell className="font-medium text-zinc-700 hidden md:table-cell">
        {formatIDR(Number(product.price ?? 0))}
      </TableCell>
      <TableCell>
        <StatusBadge status={product.stockStatus || 'IN_STOCK'} />
      </TableCell>
      <TableCell>
        <RowActions productId={product.id} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
