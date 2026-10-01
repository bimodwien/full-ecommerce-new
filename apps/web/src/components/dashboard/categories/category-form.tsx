'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CategoryFormState } from './use-category-form';

interface CategoryFormProps {
  title: string;
  submitLabel: string;
  submitDisabled?: boolean;
  form: CategoryFormState;
}

const FormHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <div className="flex items-center gap-4 mb-8 text-zinc-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="p-2"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-semibold text-zinc-800">{title}</h1>
    </div>
  );
};

const NameCard = ({ formik }: Pick<CategoryFormState, 'formik'>) => (
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
          <p className="text-sm text-red-600 mt-1">{formik.errors.name}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const FormActions = ({
  submitLabel,
  submitDisabled,
}: Pick<CategoryFormProps, 'submitLabel' | 'submitDisabled'>) => {
  const router = useRouter();
  return (
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
        disabled={submitDisabled}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        {submitLabel}
      </Button>
    </div>
  );
};

const CategoryForm = ({
  title,
  submitLabel,
  submitDisabled,
  form,
}: CategoryFormProps) => (
  <div className="min-h-screen bg-white p-6">
    <div className="max-w-7xl mx-auto">
      <FormHeader title={title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={form.handleSubmit}>
            <NameCard formik={form.formik} />
            <FormActions
              submitLabel={submitLabel}
              submitDisabled={submitDisabled}
            />
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default CategoryForm;
