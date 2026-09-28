import React from 'react';
import DOMPurify from 'dompurify';
import { TProduct } from '@/models/product.model';
import { formatIDR } from '@/lib/utils';
import VariantPicker from './variant-picker';
import PurchaseActions from './purchase-actions';
import { ProductDetailState } from './use-product-detail';

function Description({ product }: { product: TProduct }) {
  const html = DOMPurify.sanitize(
    product.descriptionHtml || product.description || '',
    { USE_PROFILES: { html: true } },
  );
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-ink mb-3">Description</h2>
      <article
        className="tiptap-content text-ink text-sm leading-6 space-y-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

type Props = { product: TProduct; detail: ProductDetailState };

export default function ProductSummary({ product, detail }: Props) {
  return (
    <div className="flex-1 min-w-0">
      <h1 className="text-ink text-2xl font-medium leading-8">
        {product.name}
      </h1>
      <div className="text-ink text-xl font-medium leading-10">
        {formatIDR(Number(product.price))}
      </div>
      {product.Variants && product.Variants.length > 0 && (
        <VariantPicker
          variants={product.Variants}
          selectedVariantId={detail.selectedVariantId}
          onSelect={detail.selectVariant}
        />
      )}
      <PurchaseActions detail={detail} />
      <Description product={product} />
    </div>
  );
}
