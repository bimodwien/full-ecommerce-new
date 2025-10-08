'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/libraries/axios';
import { useRouter } from 'next/navigation';
import { TCategory } from '@/models/category.model';
import { TProduct } from '@/models/product.model';
import { fetchCategory } from '@/helpers/fetch-category';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// removed Textarea in favor of rich text editor
import dynamic from 'next/dynamic';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), {
  ssr: false,
});

type VariantInput = { id: string; variant: string; stock: number };

function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [variantList, setVariantList] = useState<VariantInput[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);
  const [descriptionHtml, setDescriptionHtml] = useState<string>('');

  useEffect(() => {
    fetchCategory(setCategories);
  }, []);

  const formik = useFormik({
    initialValues: { name: '', description: '', price: '', categoryId: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Product name is required'),
      description: Yup.string().required('Description is required'),
      price: Yup.number()
        .typeError('Price must be a number')
        .required('Price is required')
        .min(0, 'Price must be >= 0'),
      categoryId: Yup.string().required('Category is required'),
    }),
    onSubmit: async (values) => {
      const cleanVariants = (variantList || [])
        .map((v) => ({
          variant: v.variant.trim(),
          stock: Number(v.stock) || 0,
        }))
        .filter((v) => v.variant.length > 0);

      const fd = new FormData();
      fd.append('name', values.name);
      // Prefer HTML description so backend can store it as descriptionHtml
      // If backend expects markdown, swap to values.description
      fd.append('description', descriptionHtml || values.description);
      fd.append('price', String(values.price));
      fd.append('categoryId', values.categoryId);
      if (cleanVariants.length > 0)
        fd.append('variant', JSON.stringify(cleanVariants));
      files.forEach((f) => fd.append('image', f));

      if (files.length === 0) {
        toast.error('Please upload at least 1 product image');
        return;
      }

      const toastId = toast.loading('Creating product...');
      try {
        await axiosInstance().post<TProduct>('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully', { id: toastId });
        router.push('/dashboard/products');
      } catch (err: any) {
        let message = 'Failed to create product';
        const data = err?.response?.data;
        if (typeof data?.message === 'string') message = data.message;
        else if (typeof data?.error === 'string') message = data.error;
        else if (Array.isArray(data?.errors)) message = data.errors.join(', ');
        else if (err?.message) message = err.message;
        toast.error(message, { id: toastId });
        console.error('Error submitting form: ', err);
      }
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const next = [...files, ...selected];
    if (next.length > 5) {
      toast.error('Maximum 5 images allowed');
    }
    setFiles(next.slice(0, 5));
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariantList((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        variant: '',
        stock: 0,
      },
    ]);
  };

  const updateVariant = (
    id: string,
    field: 'variant' | 'stock',
    value: string,
  ) => {
    setVariantList((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, [field]: field === 'stock' ? Number(value) || 0 : value }
          : v,
      ),
    );
  };

  const removeVariant = (id: string) => {
    setVariantList((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
  <div className="flex items-center gap-4 mb-6 text-zinc-700">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-800">Add New Product</h1>
          </div>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left Column */}
          <div className="space-y-6">
            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-800">Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName" className="text-zinc-700">Product Name</Label>
                  <Input
                    id="productName"
                    {...formik.getFieldProps('name')}
                    placeholder="e.g., Nike Air Max 270"
                    className="mt-1"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-zinc-700">Product Description</Label>
                  </div>
                  <RichTextEditor
                    value={descriptionHtml}
                    placeholder="Describe your product here..."
                    onChange={(html, plain) => {
                      setDescriptionHtml(html);
                      // keep a plain text fallback to satisfy validation
                      formik.setFieldValue('description', plain);
                    }}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-800">Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-zinc-700">Product Category</Label>
                  <Select
                    value={formik.values.categoryId}
                    onValueChange={(val) =>
                      formik.setFieldValue('categoryId', val)
                    }
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
                  {formik.touched.categoryId && formik.errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">
                      {formik.errors.categoryId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Variant Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-800">Variant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {variantList.map((variant) => (
                  <div key={variant.id} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-zinc-700">Variant Name</Label>
                      <Input
                        placeholder="e.g., Size M, Red Color"
                        value={variant.variant}
                        onChange={(e) =>
                          updateVariant(variant.id, 'variant', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-zinc-700">Stock</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={String(variant.stock)}
                        onChange={(e) =>
                          updateVariant(variant.id, 'stock', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(variant.id)}
                      className="p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {variantList.length === 0 && (
                  <p className="text-zinc-500 text-sm">Product variants</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addVariant}
                  className="w-full text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-800">
                  Product Images
                  <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center text-xs text-white">
                    ?
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {files.map((file, idx) => (
                    <div key={`${idx}-${file.name}`} className="relative group">
                      <div className="relative aspect-square border-2 border-dashed border-zinc-200 rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="Product"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-transparent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs bg-white hover:bg-zinc-100 text-zinc-700 px-3 py-1"
                            onClick={() => removeImage(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {files.length < 5 && (
                    <div className="aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-600 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        ref={imageRef}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                        <span className="text-sm text-zinc-500 text-center">
                          Click to upload
                          <br />
                          or drag and drop
                        </span>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-500">
                  Upload up to 5 images. Recommended size: 800x800px
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-800">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price" className="text-zinc-700">Price</Label>
                  <div className="flex mt-1">
                    <div className="px-3 py-2 bg-zinc-50 border border-zinc-200 border-r-0 rounded-l text-sm">
                      IDR
                    </div>
                    <Input
                      id="price"
                      type="number"
                      {...formik.getFieldProps('price')}
                      placeholder="180000"
                      className="rounded-l-none border-l-0"
                    />
                  </div>
                  {formik.touched.price && formik.errors.price && (
                    <p className="text-sm text-red-600 mt-1">
                      {String(formik.errors.price)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              >
                Add Product
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
