'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/libraries/axios';
import { toast } from 'sonner';

type TCategory = { id: string; name: string };
type GetCategoryResponse = { message: string; category: TCategory };

const EditCategories = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = String(params?.id || '');
  const [initialLoaded, setInitialLoaded] = useState(false);

  const formik = useFormik({
    initialValues: { name: '' },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Category name is required'),
    }),
    onSubmit: async (values) => {
      const toastId = toast.loading('Updating category...');
      try {
        // Backend expects PUT /categories/:id
        await axiosInstance().put(`/categories/${categoryId}`, values);
        toast.success('Category updated successfully', { id: toastId });
        setTimeout(() => router.push('/dashboard/categories'), 600);
      } catch (err: any) {
        let message = 'Failed to update category';
        const data = err?.response?.data;
        if (typeof data?.message === 'string') message = data.message;
        else if (typeof data?.error === 'string') message = data.error;
        else if (Array.isArray(data?.errors)) message = data.errors.join(', ');
        else if (err?.message) message = err.message;
        toast.error(message, { id: toastId });
        console.error('Error updating category:', err);
      }
    },
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!categoryId || initialLoaded) return;
      try {
        const { data } = await axiosInstance().get<GetCategoryResponse>(
          `/categories/${categoryId}`,
        );
        if (!mounted) return;
        formik.setValues({ name: data.category?.name || '' });
        setInitialLoaded(true);
      } catch (err) {
        toast.error('Failed to load category');
        console.error('Error loading category:', err);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [categoryId, formik, initialLoaded]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Category
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const errors = await formik.validateForm();
                formik.setTouched({ name: true });
                if (Object.keys(errors).length > 0) {
                  const firstMsg =
                    (errors.name as string) || 'Please fix validation errors';
                  toast.error(firstMsg);
                  return;
                }
                await formik.handleSubmit(e as any);
              }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Category Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      {...formik.getFieldProps('name')}
                      placeholder="Enter category name"
                      className="mt-1"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!initialLoaded}
                  className="flex-1 bg-[#15AD39] hover:bg-[#12a034] text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategories;
