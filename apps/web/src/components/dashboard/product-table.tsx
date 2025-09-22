'use client';
import React from 'react';
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
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'IN_STOCK':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
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
const ProductTable = ({ products }: ProductTableProps) => {
  const router = useRouter();

  const handleDelete = (productId: string, productName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${productName}" product?`,
      )
    ) {
      console.log('Deleting product:', productId);
      alert('Product deleted successfully!');
      // Here you would typically call an API to delete the product
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                      <span className="font-medium text-gray-900 text-sm sm:text-base block truncate">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500 sm:hidden block">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 first-letter:capitalize hidden sm:table-cell">
                  {product.category}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm text-gray-900">
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-gray-900 hidden md:table-cell">
                  IDR {product.price.toLocaleString()}
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
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(product.id, product.name)}
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
    </div>
  );
};

export default ProductTable;
