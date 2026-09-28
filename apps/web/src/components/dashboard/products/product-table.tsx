'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TProductList } from '@/models/product.model';
import ProductRow from './product-row';
import DeleteProductDialog, { useDeleteProduct } from './delete-product-dialog';

interface ProductTableProps {
  products: TProductList[];
  onDeleteSuccess?: (id: string) => void;
}

const ProductTable = ({ products, onDeleteSuccess }: ProductTableProps) => {
  const deletion = useDeleteProduct(onDeleteSuccess);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden text-zinc-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-50">Product Name</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onDelete={() =>
                  deletion.promptDelete({ id: product.id, name: product.name })
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <DeleteProductDialog state={deletion} />
    </div>
  );
};

export default ProductTable;
