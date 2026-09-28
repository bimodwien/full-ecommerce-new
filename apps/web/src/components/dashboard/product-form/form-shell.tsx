import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  left: React.ReactNode;
  right: React.ReactNode;
};

export default function ProductFormShell({
  title,
  onSubmit,
  left,
  right,
}: Props) {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6 text-zinc-700">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-800">{title}</h1>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="space-y-6">{left}</div>
          <div className="space-y-6">{right}</div>
        </form>
      </div>
    </div>
  );
}
