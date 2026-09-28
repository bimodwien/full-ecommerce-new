'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TCategory } from '@/models/category.model';
import { ProductFormik, ProductFormValues } from './types';

const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor'),
  {
    ssr: false,
  },
);

type FieldErrorProps = {
  formik: ProductFormik;
  field: keyof ProductFormValues;
};

export function FieldError({ formik, field }: FieldErrorProps) {
  if (!formik.touched[field] || !formik.errors[field]) return null;
  return (
    <p className="text-sm text-red-600 mt-1">{String(formik.errors[field])}</p>
  );
}

type DescriptionCardProps = {
  formik: ProductFormik;
  descriptionHtml: string;
  onDescriptionChange: (html: string) => void;
};

export function DescriptionCard(props: DescriptionCardProps) {
  const { formik, descriptionHtml, onDescriptionChange } = props;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-zinc-800">Description</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="productName" className="text-zinc-700">
            Product Name
          </Label>
          <Input
            id="productName"
            {...formik.getFieldProps('name')}
            placeholder="e.g., Nike Air Max 270"
            className="mt-1"
          />
          <FieldError formik={formik} field="name" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-zinc-700">Product Description</Label>
          </div>
          <RichTextEditor
            value={descriptionHtml}
            placeholder="Describe your product here..."
            onChange={(html, plain) => {
              onDescriptionChange(html);
              // keep a plain text fallback to satisfy validation
              formik.setFieldValue('description', plain);
            }}
          />
          <FieldError formik={formik} field="description" />
        </div>
      </CardContent>
    </Card>
  );
}

type CategoryCardProps = { formik: ProductFormik; categories: TCategory[] };

export function CategoryCard({ formik, categories }: CategoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-zinc-800">Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-zinc-700">Product Category</Label>
          <Select
            value={formik.values.categoryId}
            onValueChange={(val) => formik.setFieldValue('categoryId', val)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="capitalize">{cat.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError formik={formik} field="categoryId" />
        </div>
      </CardContent>
    </Card>
  );
}
