import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageTile, UploadTile } from './image-tiles';
import { AddProductImages } from './use-add-product-images';

export default function AddImagesCard({
  images,
}: {
  images: AddProductImages;
}) {
  const { files, removeImage, handleImageUpload, imageRef } = images;
  return (
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
            <ImageTile
              key={`${idx}-${file.name}`}
              src={URL.createObjectURL(file)}
              alt="Product"
              unoptimized
              buttonLabel="Remove"
              onButtonClick={() => removeImage(idx)}
            />
          ))}
          {files.length < 5 && (
            <UploadTile onChange={handleImageUpload} inputRef={imageRef} />
          )}
        </div>
        <p className="text-sm text-zinc-500">
          Upload up to 5 images. Recommended size: 800x800px
        </p>
      </CardContent>
    </Card>
  );
}
