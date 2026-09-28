import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VariantRow } from './types';
import { VariantRowsState } from './use-variant-rows';

type RowProps = {
  row: VariantRow;
  rows: VariantRowsState;
};

function RowPriceInput({ row, rows }: RowProps) {
  return (
    <div className="w-36">
      <Label className="text-zinc-700">Price (IDR)</Label>
      <Input
        type="number"
        placeholder="180000"
        value={row.price}
        onChange={(e) => rows.updateVariant(row.key, 'price', e.target.value)}
        className="mt-1"
      />
    </div>
  );
}

function VariantRowFields({ row, rows }: RowProps) {
  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <Label className="text-zinc-700">Variant Name</Label>
        <Input
          placeholder="e.g., Size M, Red Color"
          value={row.variant}
          onChange={(e) =>
            rows.updateVariant(row.key, 'variant', e.target.value)
          }
          className="mt-1"
        />
      </div>
      <div className="w-24">
        <Label className="text-zinc-700">Stock</Label>
        <Input
          type="number"
          placeholder="0"
          value={String(row.stock)}
          onChange={(e) => rows.updateVariant(row.key, 'stock', e.target.value)}
          className="mt-1"
        />
      </div>
      {rows.perVariantPrice && <RowPriceInput row={row} rows={rows} />}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => rows.removeVariant(row.key)}
        className="p-2"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PerVariantPriceToggle({ rows }: { rows: VariantRowsState }) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer select-none">
      <input
        type="checkbox"
        className="h-4 w-4 accent-emerald-600"
        checked={rows.perVariantPrice}
        onChange={(e) => rows.setPerVariantPrice(e.target.checked)}
      />
      Different price per variant
    </label>
  );
}

export default function VariantCard({ rows }: { rows: VariantRowsState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-zinc-800">Variant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PerVariantPriceToggle rows={rows} />
        {rows.variants.map((row) => (
          <VariantRowFields key={row.key} row={row} rows={rows} />
        ))}
        {rows.variants.length === 0 && (
          <p className="text-zinc-500 text-sm">Product variants</p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={rows.addVariant}
          className="w-full text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardContent>
    </Card>
  );
}
