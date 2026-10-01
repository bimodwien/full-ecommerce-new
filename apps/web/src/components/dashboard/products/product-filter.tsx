'use client';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchBar } from '@/components/ui/search-bar';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const StatusSelect = ({ value, onChange }: FilterSelectProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-40">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="IN_STOCK">In Stock</SelectItem>
      <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
      <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
    </SelectContent>
  </Select>
);

const CategorySelect = ({
  value,
  onChange,
  categories,
}: FilterSelectProps & { categories: string[] }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-full sm:w-40">
      <SelectValue placeholder="Category" />
    </SelectTrigger>
    <SelectContent>
      {categories.map((category) => (
        <SelectItem key={category} value={category}>
          {category}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const ProductFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: ProductFiltersProps) => {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 mb-6 text-zinc-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <SearchBar
          placeholder="Search products..."
          value={searchTerm}
          onChange={onSearchChange}
          className="flex-1 max-w-full sm:max-w-sm"
        />
        <StatusSelect value={statusFilter} onChange={onStatusChange} />
        <CategorySelect
          value={categoryFilter}
          onChange={onCategoryChange}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default ProductFilter;
