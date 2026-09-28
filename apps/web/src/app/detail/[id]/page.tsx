'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomepageSidebar from '@/components/homepage/homepage-sidebar';
import ProductGallery from '@/components/detail/product-gallery';
import ProductSummary from '@/components/detail/product-summary';
import { useProductDetail } from '@/components/detail/use-product-detail';

function DetailContent() {
  const detail = useProductDetail();
  const { product } = detail;
  if (!product) return <div>Loading...</div>;
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-10">
        <ProductGallery
          product={product}
          selectedImageId={detail.selectedImageId}
          onSelectImage={detail.setSelectedImageId}
        />
        <ProductSummary product={product} detail={detail} />
      </div>
    </div>
  );
}

function PageDetail() {
  return (
    <div>
      <Header />
      <div className="mx-auto max-w-screen-2xl px-4 min-h-screen">
        <div className="flex items-stretch gap-4 py-8">
          <div className="flex-1 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-mute hover:text-ink w-fit mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Link>
            <DetailContent />
          </div>
          <div className="hidden lg:block w-72 shrink-0 self-start sticky top-8">
            <Suspense fallback={null}>
              <HomepageSidebar />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PageDetail;
