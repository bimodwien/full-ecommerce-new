'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard, type Product } from '@/components/homepage/product-card';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    image: 'https://placehold.co/246x246',
    category: 'Snack',
    title: 'Seeds of Change Organic Quinoa Natural',
    vendor: 'NestFood',
    price: 28.85,
    oldPrice: 32.8,
    label: 'Hot',
    rating: 4,
  },
  {
    id: '2',
    image: 'https://placehold.co/246x246',
    category: 'Herbs Foods',
    title: 'All Natural Italian-Style Chicken Meatballs',
    vendor: 'Stouffer',
    price: 52.85,
    oldPrice: 55.8,
    label: 'Sale',
    rating: 3.5,
  },
  {
    id: '3',
    image: 'https://placehold.co/246x246',
    category: 'Snack',
    title: "Angie's Boomchickapop Sweet & Salty",
    vendor: 'StarKist',
    price: 48.85,
    oldPrice: 52.8,
    label: 'New',
    rating: 4,
  },
  {
    id: '4',
    image: 'https://placehold.co/246x246',
    category: 'Vegetables',
    title: 'Foster Farms Takeout Crispy Classic',
    vendor: 'NestFood',
    price: 17.85,
    oldPrice: 19.8,
    rating: 4,
  },
  {
    id: '5',
    image: 'https://placehold.co/246x246',
    category: 'Pet Foods',
    title: 'Blue Diamond Almonds Lightly Natural',
    vendor: 'NestFood',
    price: 23.85,
    oldPrice: 25.8,
    rating: 4,
  },
  {
    id: '6',
    image: 'https://placehold.co/246x246',
    category: 'Herbs Foods',
    title: 'Chobani Complete Vanilla Greek Bottle',
    vendor: 'NestFood',
    price: 54.85,
    oldPrice: 59.8,
    rating: 4,
  },
  {
    id: '7',
    image: 'https://placehold.co/246x246',
    category: 'Meats',
    title: 'Canada Dry Ginger Ale – 2 L Bottle',
    vendor: 'NestFood',
    price: 32.85,
    oldPrice: 35.8,
    rating: 4,
  },
  {
    id: '8',
    image: 'https://placehold.co/246x246',
    category: 'Snack',
    title: 'Encore Seafoods Stuffed Alaskan',
    vendor: 'NestFood',
    price: 35.85,
    oldPrice: 37.8,
    label: 'Sale',
    rating: 4,
  },
  {
    id: '9',
    image: 'https://placehold.co/246x246',
    category: 'Coffes',
    title: "Gorton's Beer Battered Fish Fillets",
    vendor: 'Old El Paso',
    price: 23.85,
    oldPrice: 25.8,
    label: 'Hot',
    rating: 4,
  },
  {
    id: '10',
    image: 'https://placehold.co/246x246',
    category: 'Cream',
    title: 'Haagen-Dazs Caramel Cone Ice Cream',
    vendor: 'Tyson',
    price: 22.85,
    oldPrice: 24.8,
    rating: 4,
  },
  {
    id: '11',
    image: 'https://placehold.co/246x246',
    category: 'Snack',
    title: 'Organic Granola Clusters Honey Almond',
    vendor: 'NestFood',
    price: 18.5,
    oldPrice: 20,
    rating: 4.5,
  },
  {
    id: '12',
    image: 'https://placehold.co/246x246',
    category: 'Drinks',
    title: 'Sparkling Water Lime Zero Sugar 330ml',
    vendor: 'NestFood',
    price: 12.9,
    rating: 4,
  },
];

const ProductCardSection = () => {
  const itemsPerPage = 8;
  const [showAll, setShowAll] = useState(false);
  const hasMore = MOCK_PRODUCTS.length > itemsPerPage;
  const visibleProducts = showAll
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.slice(0, itemsPerPage);

  return (
    <section>
      <div
        id="product-grid"
        className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
      >
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {hasMore && !showAll && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 text-emerald-600 text-sm hover:text-emerald-700 cursor-pointer"
            aria-controls="product-grid"
            onClick={() => setShowAll(true)}
          >
            ...more
          </Button>
        </div>
      )}
    </section>
  );
};

export default ProductCardSection;
