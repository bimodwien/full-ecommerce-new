'use client';

import React from 'react';
import { MoreHorizontal, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { TCategory } from '@/models/category.model';

interface CategoryTableProps {
  categories: TCategory[];
}

const CategoryTable = ({ categories }: CategoryTableProps) => {
  const router = useRouter();

  const handleDelete = (categoryId: string, categoryName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${categoryName}" category?`,
      )
    ) {
      console.log('Deleting category:', categoryId);
      alert('Category deleted successfully!');
      // Here you would typically call an API to delete the category
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <FolderOpen className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No categories found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or add a new category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Category Name</TableHead>
              <TableHead className="hidden sm:table-cell">
                Products Count
              </TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className=" text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-500 sm:hidden">
                      {category.productCount ?? 0} products
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 hidden sm:table-cell">
                  {category.productCount ?? 0} products
                </TableCell>
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
                            `/dashboard/categories/edit/${category.id}`,
                          )
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(category.id, category.name)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Category
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

export default CategoryTable;
