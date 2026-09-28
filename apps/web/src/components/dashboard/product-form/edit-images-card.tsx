import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productImageUrl } from '@/lib/product-display';
import { ImageTile, UploadTile } from './image-tiles';
import { EditProductImages } from './use-edit-product-images';

type Props = { images: EditProductImages };

function ImageTiles({ images }: Props) {
  const { serverImages, removeImageIds, newFiles, slotsLeft } = images;
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {serverImages.map((img) => {
        const marked = removeImageIds.includes(img.id);
        return (
          <ImageTile
            key={img.id}
            src={productImageUrl(img.id)}
            alt="Product"
            markedForDeletion={marked}
            buttonLabel={marked ? 'Undo' : 'Remove'}
            onButtonClick={() => images.toggleRemoveServerImage(img.id)}
          />
        );
      })}
      {newFiles.map((file, idx) => (
        <ImageTile
          key={`${idx}-${file.name}`}
          src={URL.createObjectURL(file)}
          alt="New Product"
          unoptimized
          buttonLabel="Remove"
          onButtonClick={() => images.removeNewFile(idx)}
        />
      ))}
      {slotsLeft > 0 && (
        <UploadTile
          onChange={images.handleNewFiles}
          inputRef={images.imageRef}
          hint={`${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} left`}
        />
      )}
    </div>
  );
}

export default function EditImagesCard({ images }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent>
        <ImageTiles images={images} />
        <p className="text-sm text-zinc-500">
          {images.totalEffectiveCount}/5 images selected. Recommended size:
          800x800px
        </p>
        <p className="text-xs text-zinc-500">
          Existing images can be marked for deletion and will be removed after
          you save.
        </p>
      </CardContent>
    </Card>
  );
}
