export type TCategory = {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

// GET /categories/:id
export type GetCategoryResponse = { message: string; category: TCategory };
