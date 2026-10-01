'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CategoryForm from '@/components/dashboard/categories/category-form';
import {
  useCategoryForm,
  useLoadCategory,
} from '@/components/dashboard/categories/use-category-form';
import { axiosInstance } from '@/libraries/axios';

const EditCategories = () => {
  const params = useParams<{ id: string }>();
  const categoryId = String(params?.id || '');

  const form = useCategoryForm({
    // Backend expects PUT /categories/:id
    save: (values) => axiosInstance().put(`/categories/${categoryId}`, values),
    messages: {
      loading: 'Updating category...',
      success: 'Category updated successfully',
      error: 'Failed to update category',
    },
  });
  const loaded = useLoadCategory(categoryId, form.formik.setValues);

  return (
    <CategoryForm
      title="Edit Category"
      submitLabel="Save Changes"
      submitDisabled={!loaded}
      form={form}
    />
  );
};

export default EditCategories;
