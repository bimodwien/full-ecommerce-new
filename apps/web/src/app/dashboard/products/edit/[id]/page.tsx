'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { axiosInstance } from '@/libraries/axios';
import { fetchProductDetail } from '@/helpers/fetch-product';
import { fetchCategory } from '@/helpers/fetch-category';
import { TCategory } from '@/models/category.model';
import { TProductImage } from '@/models/product.model';
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), {
  ssr: false,
});

type VariantRow = { key: string; id?: string; variant: string; stock: number };

// using fetchProductDetail helper for loading detail

export default function EditProduct() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = String(params?.id || '');

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [serverImages, setServerImages] = useState<TProductImage[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  // Derived image counts
  const remainingExisting = useMemo(
    () => serverImages.filter((img) => !removeImageIds.includes(img.id)),
    [serverImages, removeImageIds],
  );
  const totalEffectiveCount = useMemo(
    () => remainingExisting.length + newFiles.length,
    [remainingExisting.length, newFiles.length],
  );
  const slotsLeft = Math.max(0, 5 - totalEffectiveCount);

  // Compute API base for image URLs (fallback to localhost dev)
  const imageBase = useMemo(() => {
    const base =
      process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api';
    return base.replace(/\/$/, '');
  }, []);

  useEffect(() => {
    fetchCategory(setCategories);
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
    },
    enableReinitialize: true,
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
      // ensure at least one image remains
      const remainingCount =
        serverImages.filter((img) => !removeImageIds.includes(img.id)).length +
        newFiles.length;
      if (remainingCount === 0) {
        toast.error('Please keep at least one product image');
        return;
      }

      // Build variant updates payload
      const variantUpdates = variants.map((v) => ({
        id: v.id,
        variant: v.variant.trim(),
        stock: Number(v.stock) || 0,
      }));

      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('description', descriptionHtml || values.description);
      fd.append('price', String(values.price));
      fd.append('categoryId', values.categoryId);
      if (variantUpdates.length > 0)
        fd.append('variantUpdates', JSON.stringify(variantUpdates));
      if (removedVariantIds.length > 0)
        fd.append('removeVariantIds', JSON.stringify(removedVariantIds));
      if (removeImageIds.length > 0)
        fd.append('removeImageIds', JSON.stringify(removeImageIds));
      newFiles.forEach((f) => fd.append('image', f));

      const toastId = toast.loading('Updating product...');
      try {
        await axiosInstance().patch(`/products/${productId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully', { id: toastId });
        setTimeout(() => router.push('/dashboard/products'), 600);
      } catch (err: any) {
        const data = err?.response?.data;
        let message = 'Failed to update product';
        if (typeof data?.message === 'string') message = data.message;
        else if (typeof data?.error === 'string') message = data.error;
        else if (Array.isArray(data?.errors)) message = data.errors.join(', ');
        else if (err?.message) message = err.message;
        toast.error(message, { id: toastId });
        console.error('Error updating product:', err);
      }
    },
  });

  // Show the first validation error in a toast after a submit attempt
  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      const { errors } = formik;
      const firstMsg =
        (errors.name as string) ||
        (errors.description as string) ||
        (errors.price as string) ||
        (errors.categoryId as string) ||
        'Please fix validation errors';
      toast.error(firstMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.submitCount, formik.errors]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!productId) return;
      try {
        const p = await fetchProductDetail(productId);
        if (!mounted) return;
        formik.setValues({
          name: p.name || '',
          description: (p.descriptionHtml || p.description || '')
            .replace(/<[^>]*>/g, '')
            .trim(),
          price: String(p.price ?? ''),
          categoryId: (p.categoryId as string) || p.Category?.id || '',
        });
        setDescriptionHtml(p.descriptionHtml || p.description || '');
        setServerImages(p.Images || []);
        setVariants(
          (p.Variants || []).map((v) => ({
            key: v.id,
            id: v.id,
            variant: v.variant,
            stock: v.stock,
          })),
        );
        setInitialLoaded(true);
      } catch (err) {
        toast.error('Failed to load product');
        console.error('Error loading product:', err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    const canTake = Math.max(0, slotsLeft);
    if (canTake <= 0) {
      toast.error('You already have the maximum of 5 images');
      return;
    }
    const accepted = picked.slice(0, canTake);
    const rejected = picked.length - accepted.length;
    if (rejected > 0) {
      toast.error(
        `Only ${canTake} more image${canTake > 1 ? 's' : ''} can be added`,
      );
    }
    setNewFiles((prev) => [...prev, ...accepted]);
    // clear input value so same files can be picked again if removed
    if (imageRef.current) imageRef.current.value = '';
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveServerImage = (imgId: string) => {
    setRemoveImageIds((prev) =>
      prev.includes(imgId)
        ? prev.filter((id) => id !== imgId)
        : [...prev, imgId],
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        variant: '',
        stock: 0,
      },
    ]);
  };

  const updateVariant = (
    key: string,
    field: 'variant' | 'stock',
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.key === key
          ? { ...v, [field]: field === 'stock' ? Number(value) || 0 : value }
          : v,
      ),
    );
  };

  const removeVariant = (key: string) => {
    setVariants((prev) => {
      const found = prev.find((v) => v.key === key);
      if (found?.id) setRemovedVariantIds((ids) => [...ids, found.id!]);
      return prev.filter((v) => v.key !== key);
    });
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
            <h1 className="text-2xl font-semibold text-zinc-800">
              Edit Product
            </h1>
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
                  <Label htmlFor="productName" className="text-zinc-700">
                    Product Name
                  </Label>
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
                {variants.map((v) => (
                  <div key={v.key} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label className="text-zinc-700">Variant Name</Label>
                      <Input
                        placeholder="e.g., Size M, Red Color"
                        value={v.variant}
                        onChange={(e) =>
                          updateVariant(v.key, 'variant', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-zinc-700">Stock</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={String(v.stock)}
                        onChange={(e) =>
                          updateVariant(v.key, 'stock', e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(v.key)}
                      className="p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {variants.length === 0 && (
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
            {/* Unified Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Existing images (toggle remove) */}
                  {serverImages.map((img) => {
                    const url = `${imageBase}/products/image/${img.id}`;
                    const marked = removeImageIds.includes(img.id);
                    return (
                      <div key={img.id} className="relative group">
                        <div
                          className={`relative aspect-square border-2 border-dashed rounded-lg overflow-hidden ${marked ? 'opacity-50' : ''}`}
                        >
                          <Image
                            src={url}
                            alt="Product"
                            fill
                            className="object-cover"
                          />
                          {marked && (
                            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs rounded bg-red-600 text-white shadow">
                              Marked for deletion
                            </span>
                          )}
                          <div className="absolute inset-0 bg-transparent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-1"
                              onClick={() => toggleRemoveServerImage(img.id)}
                            >
                              {marked ? 'Undo' : 'Remove'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* New files (remove from client list) */}
                  {newFiles.map((file, idx) => (
                    <div key={`${idx}-${file.name}`} className="relative group">
                      <div className="relative aspect-square border-2 border-dashed border-zinc-200 rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="New Product"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-transparent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="text-xs bg-white hover:bg-zinc-100 text-zinc-700 px-3 py-1"
                            onClick={() => removeNewFile(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Upload tile appears only if slots left */}
                  {slotsLeft > 0 && (
                    <div className="aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-600 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewFiles}
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
                        <span className="text-xs text-zinc-400 mt-1">
                          {slotsLeft} slot{slotsLeft > 1 ? 's' : ''} left
                        </span>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-500">
                  {totalEffectiveCount}/5 images selected. Recommended size:
                  800x800px
                </p>
                <p className="text-xs text-zinc-500">
                  Existing images can be marked for deletion and will be removed
                  after you save.
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
                  <Label htmlFor="price" className="text-zinc-700">
                    Price
                  </Label>
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

            {/* Actions */}
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
                disabled={!initialLoaded || formik.isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
