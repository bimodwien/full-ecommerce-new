# Ecommerce (full-ecommerce-new)

This monorepo contains a Next.js frontend (`apps/web`) and an Express + Prisma API (`apps/api`).

This README documents the recent product features and developer notes we implemented in the API: product read/listing, image rendering, and business operations (create, update, delete) with image/variant handling.

## Quick plan & checklist

- [x] Document implemented product API endpoints (read, image render)
- [x] Document multipart create/update/delete behavior and payloads
- [x] Describe service split: read vs business (create/update/delete)
- [x] Provide build/run notes and small examples for testing

## What we implemented

- Product read (listing) with pagination, filtering and sorting (price_asc, price_desc, newest).
- Product create/update/delete supporting multiple images and product variants.
- Image processing: uploaded images are processed with sharp (converted to PNG) and stored as Bytes in the database.
- Image rendering endpoint streams images with caching headers (ETag, Last-Modified, Cache-Control).
- Responses are sanitized: binary image bytes are removed and each image item includes an `imageUrl` that points to the renderer endpoint.
- Service split:
  - `apps/api/src/services/product.service.ts` — read-focused functions (getAll, getByCategory, renderImage/render).
  - `apps/api/src/services/product.business.service.ts` — business operations (createProduct, updateProduct, deleteProduct).
  - `apps/api/src/services/product.helpers.ts` — shared helpers/types (sanitizeProduct, types).

## API endpoints (important)

- GET /api/products
  - Query params: `page`, `limit`, `name`, `categoryId`, `minPrice`, `maxPrice`, `sort` (`newest|price_asc|price_desc`)
  - Returns paginated sanitized products (no raw image bytes). Each image has `imageUrl`.

- GET /api/products/category/:categoryId
  - Convenience route for category-filtered listing (supports same query params for pagination/sort).

  - Streams the image for a `ProductImage.id` (preferred) or falls back to a product's primary image when given a `Product.id`.
  - Sets ETag, Last-Modified and Cache-Control headers. Content-Type is `image/png`.
    GET /api/products/:id
  - Returns a single product by `id` with full details and all images (ordered with `isPrimary` first).
  - Use this endpoint when the frontend needs all product images (gallery view).
  - Response is sanitized (no raw image `data`); use the included `imageUrl` to fetch each image.

  - Content-Type: `multipart/form-data`
  - Fields:
  - Note: list endpoints (`GET /api/products` and `GET /api/products/category/:categoryId`) return only the product's primary image (small payload). Use `GET /api/products/:id` to retrieve all images for a product.
  - `name` (string, required)
  - `description` (string, optional)
  - `price` (number, required)
  - `categoryId` (string, optional)
  - `variant` (optional) — JSON string or array of variants: [{ "variant": "S", "stock": 10 }, ...]
  - `image` files (one or more) — form field name `image` (max 5 by default)
  - Uploaded images are processed (PNG) and stored in DB. First uploaded image is marked `isPrimary` by default.

- PATCH /api/products/:id (requires authentication + admin role)
  - Content-Type: `multipart/form-data`
  - Fields: same as create. Additional optional fields for updates:
    - `removeImageIds` — JSON array of image ids to delete
    - `variantUpdates` — JSON array of variant upserts/updates: [{ id?, variant?, stock? }]
    - `removeVariantIds` — JSON array of variant ids to delete

- DELETE /api/products/:id (requires authentication + admin role)
  - Deletes the product and returns the sanitized deleted product payload.

## Category endpoints

- GET /api/categories
  - Query params: `page`, `limit`, `name`
  - Returns paginated categories. Public endpoint.

- POST /api/categories (requires authentication + admin role)
  - Body: JSON `{ "name": "Category Name" }`
  - Creates a new category.

- PUT /api/categories/:id (requires authentication + admin role)
  - Body: JSON `{ "name": "New Name" }`
  - Updates existing category by id.

- DELETE /api/categories/:id (requires authentication + admin role)
  - Deletes the category by id.

Example curl for categories:

```bash
# Get categories (paginated)
curl "http://localhost:8000/api/categories?page=1&limit=10"

# Create category (admin)
curl -X POST "http://localhost:8000/api/categories" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Category"}'

# Update category (admin)
curl -X PUT "http://localhost:8000/api/categories/<CATEGORY_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Renamed"}'

# Delete category (admin)
curl -X DELETE "http://localhost:8000/api/categories/<CATEGORY_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

## Data shape (sanitized responses)

- Product (partial)
  - id, name, description?, price, createdAt, updatedAt, seller { id, name }, Category?, Variants[], Images[]

- Image in response
  - id, isPrimary, productId, createdAt, updatedAt, imageUrl (no `data` field)

- Variant
  - id, variant (string), stock (number), productId

## Image handling details

- Multer is used with a file-filter that accepts only image mimetypes and a file size limit (see `apps/api/src/libs/multer.ts`).
- Uploaded images are normalized using `sharp(...).png()` before saving to the `ProductImage.data` (Bytes) column in Prisma.
- The public API does not return raw bytes. Use the `imageUrl` (or GET `/api/products/image/:id`) to fetch the image.
- The renderer sets ETag and Last-Modified so clients and CDN can cache images. If-None-Match is supported (responds 304).

## Service split rationale

- Read operations and rendering are kept in `product.service.ts` so they are small and testable (pure DB reads + transform).
- Create/Update/Delete and any heavy business logic (file processing, transactional flows) live in `product.business.service.ts`.
- Shared sanitize logic and type aliases live in `product.helpers.ts`.

## How to run API (local dev)

1. Install dependencies (from repo root):

```bash
# from repo root
npm install
# install in the api workspace if needed
cd apps/api && npm install
```

2. Run API in dev (hot reload):

```bash
cd apps/api
npm run dev
```

3. Build and serve production bundle:

```bash
cd apps/api
npm run build
npm run serve
```

## Example requests (curl / bash)

- Create product (multipart):

```bash
curl -X POST "http://localhost:8000/api/products" \
   -H "Authorization: Bearer <TOKEN>" \
   -F "name=My Product" \
   -F "price=12000" \
   -F "variant=[{\"variant\":\"S\",\"stock\":10}]" \
   -F "image=@./images/1.jpg" \
   -F "image=@./images/2.jpg"
```

- Update product (add images + remove image ids):

```bash
curl -X PATCH "http://localhost:8000/api/products/<PRODUCT_ID>" \
   -H "Authorization: Bearer <TOKEN>" \
   -F "name=Updated name" \
   -F "removeImageIds=[\"img-id-1\"]" \
   -F "image=@./images/new.jpg"
```

- Delete product:

```bash
curl -X DELETE "http://localhost:8000/api/products/<PRODUCT_ID>" \
   -H "Authorization: Bearer <TOKEN>"
```

## Environment variables

- `API_BASE_URL` (optional) — used to build absolute `imageUrl` values; if not set the service returns relative `imageUrl` paths.
- Standard `.env` for database connection and JWT secrets (see `apps/api/.env.example` if present).

## Developer notes & next steps

- We added ETag/Last-Modified caching on the image renderer; frontends should honor 304 responses to avoid re-downloading.
- Consider adding small integration tests for create/update/delete flows (supertest + jest) to avoid regressions.
- If you want to offload images to object storage (S3) later, move processing to the business service and store only URLs in `ProductImage`.

Questions or want me to add a short test harness or Postman collection before we pause? I can add one next.
