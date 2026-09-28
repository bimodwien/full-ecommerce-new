'use client';

import React from 'react';
import ProductFormShell from '@/components/dashboard/product-form/form-shell';
import {
  CategoryCard,
  DescriptionCard,
} from '@/components/dashboard/product-form/info-cards';
import VariantCard from '@/components/dashboard/product-form/variant-card';
import EditImagesCard from '@/components/dashboard/product-form/edit-images-card';
import {
  FormActions,
  PricingCard,
} from '@/components/dashboard/product-form/pricing-card';
import { useEditProductForm } from '@/components/dashboard/product-form/use-edit-product-form';

export default function EditProduct() {
  const form = useEditProductForm();
  const { formik } = form;

  return (
    <ProductFormShell
      title="Edit Product"
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
          <EditImagesCard images={form.images} />
          <PricingCard formik={formik} />
          <FormActions
            submitLabel="Save Changes"
            onCancel={() => form.router.back()}
            disabled={!form.initialLoaded || formik.isSubmitting}
          />
        </>
      }
    />
  );
}
