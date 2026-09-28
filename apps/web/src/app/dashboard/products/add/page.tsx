'use client';

import React from 'react';
import ProductFormShell from '@/components/dashboard/product-form/form-shell';
import {
  CategoryCard,
  DescriptionCard,
} from '@/components/dashboard/product-form/info-cards';
import VariantCard from '@/components/dashboard/product-form/variant-card';
import AddImagesCard from '@/components/dashboard/product-form/add-images-card';
import {
  FormActions,
  PricingCard,
} from '@/components/dashboard/product-form/pricing-card';
import { useAddProductForm } from '@/components/dashboard/product-form/use-add-product-form';

function AddProduct() {
  const form = useAddProductForm();
  const { formik } = form;

  return (
    <ProductFormShell
      title="Add New Product"
      onSubmit={formik.handleSubmit}
      left={
        <>
          <DescriptionCard
            formik={formik}
            descriptionHtml={form.descriptionHtml}
            onDescriptionChange={form.setDescriptionHtml}
          />
          <CategoryCard formik={formik} categories={form.categories} />
          <VariantCard rows={form.rows} />
        </>
      }
      right={
        <>
          <AddImagesCard images={form.images} />
          <PricingCard formik={formik} />
          <FormActions
            submitLabel="Add Product"
            onCancel={() => form.router.back()}
          />
        </>
      }
    />
  );
}

export default AddProduct;
