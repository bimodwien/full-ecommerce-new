import React from 'react';
import { TProductVariant } from '@/models/product.model';

type Props = {
  variants: TProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
};

function variantClass(active: boolean, disabled: boolean) {
  if (disabled)
    return 'text-stone border-hairline cursor-not-allowed opacity-40';
  if (active) return 'bg-ink text-canvas border-ink';
  return 'text-ink border-hairline hover:bg-soft-cloud';
}

export default function VariantPicker(props: Props) {
  const { variants, selectedVariantId, onSelect } = props;
  return (
    <div className="space-y-2 mt-2">
      <div className="text-sm text-mute">Available Variants:</div>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = selectedVariantId === v.id;
          const disabled = v.stock <= 0;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => !disabled && onSelect(v.id)}
              disabled={disabled}
              className={`text-sm rounded-full border px-4 py-2 transition-colors ${variantClass(active, disabled)}`}
              aria-pressed={active}
            >
              {v.variant}
            </button>
          );
        })}
      </div>
    </div>
  );
}
