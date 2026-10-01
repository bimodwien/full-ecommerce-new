'use client';
import React from 'react';
import CategoryForm from '@/components/dashboard/categories/category-form';
import { useCategoryForm } from '@/components/dashboard/categories/use-category-form';
import { axiosInstance } from '@/libraries/axios';

const AddCategories = () => {
  const form = useCategoryForm({
    save: (values) => axiosInstance().post('/categories', values),
    messages: {
      loading: 'Creating category...',
      success: 'Category created successfully',
      error: 'Failed to create category',
    },
  });

  return (
    <CategoryForm
      title="Add New Category"
      submitLabel="Add Category"
      form={form}
    />
  );
};

export default AddCategories;
