import React from 'react';
import Image from 'next/image';
import { TProduct } from '@/models/product.model';
import { productImageUrl } from '@/lib/product-display';

const NO_IMAGE = 'https://placehold.co/800x800/fff/aaa?text=No+Image';

type Props = {
  product: TProduct;
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
};

function Thumbnails({ product, selectedImageId, onSelectImage }: Props) {
  return (
    <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2">
      {product.Images!.map((img) => (
        <button
          key={img.id}
          type="button"
          onClick={() => onSelectImage(img.id)}
          className={`relative aspect-square overflow-hidden bg-soft-cloud ${
            selectedImageId === img.id ? 'ring-2 ring-ink' : ''
          }`}
          aria-label="Select image"
        >
          <Image
            src={productImageUrl(img.id)}
            alt={product.name}
            fill
            loading="eager"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductGallery(props: Props) {
  const { product, selectedImageId } = props;
  return (
    <div className="w-full md:w-96 shrink-0 md:self-start md:sticky md:top-8">
      <div className="relative aspect-square w-full overflow-hidden bg-soft-cloud">
        <Image
          src={selectedImageId ? productImageUrl(selectedImageId) : NO_IMAGE}
          alt={selectedImageId ? product.name : 'No image'}
          loading={selectedImageId ? 'eager' : undefined}
          fill
          sizes="(min-width: 768px) 384px, 100vw"
          className="object-contain p-2"
        />
      </div>
      {product.Images && product.Images.length > 1 && <Thumbnails {...props} />}
    </div>
  );
}
