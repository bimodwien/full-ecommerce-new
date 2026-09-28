import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductFormik } from '@/models/product-form.model';
import { FieldError } from './info-cards';
import { VariantRowsState } from './use-variant-rows';
import { cheapestRowPrice } from './variant-pricing';

function AutoPriceHint({ rows }: { rows: VariantRowsState }) {
  const cheapest = cheapestRowPrice(rows.variants);
  return (
    <p className="text-sm text-zinc-500 mt-1">
      {cheapest === undefined
        ? 'Set variant prices to fill this in.'
        : 'Set automatically to the cheapest variant price.'}
    </p>
  );
}

type PricingProps = { formik: ProductFormik; rows: VariantRowsState };

export function PricingCard({ formik, rows }: PricingProps) {
  const auto = rows.perVariantPrice;
  const field = formik.getFieldProps('price');
  const value = auto
    ? String(cheapestRowPrice(rows.variants) ?? '')
    : field.value;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-zinc-800">Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="price" className="text-zinc-700">
            {auto ? 'Starting price' : 'Price'}
          </Label>
          <div className="flex mt-1">
            <div className="px-3 py-2 bg-zinc-50 border border-zinc-200 border-r-0 rounded-l text-sm">
              IDR
            </div>
            <Input
              id="price"
              type="number"
              {...field}
              value={value}
              disabled={auto}
              placeholder="180000"
              className="rounded-l-none border-l-0"
            />
          </div>
          {auto ? (
            <AutoPriceHint rows={rows} />
          ) : (
            <FieldError formik={formik} field="price" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type ActionsProps = {
  submitLabel: string;
  onCancel: () => void;
  disabled?: boolean;
};

export function FormActions({ submitLabel, onCancel, disabled }: ActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 bg-transparent"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={disabled}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        {submitLabel}
      </Button>
    </div>
  );
}
