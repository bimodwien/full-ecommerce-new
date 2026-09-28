import React from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ImageTileProps = {
  src: string;
  alt: string;
  buttonLabel: string;
  onButtonClick: () => void;
  unoptimized?: boolean;
  markedForDeletion?: boolean;
};

export function ImageTile(props: ImageTileProps) {
  const { src, alt, buttonLabel, onButtonClick } = props;
  return (
    <div className="relative group">
      <div
        className={`relative aspect-square border-2 border-dashed border-zinc-200 rounded-lg overflow-hidden ${props.markedForDeletion ? 'opacity-50' : ''}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          unoptimized={props.unoptimized}
        />
        {props.markedForDeletion && (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs rounded bg-red-600 text-white shadow">
            Marked for deletion
          </span>
        )}
        <div className="absolute inset-0 bg-transparent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="text-xs bg-white hover:bg-zinc-100 text-zinc-700 px-3 py-1"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

type UploadTileProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  hint?: string;
};

export function UploadTile({ onChange, inputRef, hint }: UploadTileProps) {
  return (
    <div className="aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-600 transition-colors">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
        id="image-upload"
        ref={inputRef}
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
        {hint && <span className="text-xs text-zinc-400 mt-1">{hint}</span>}
      </label>
    </div>
  );
}
