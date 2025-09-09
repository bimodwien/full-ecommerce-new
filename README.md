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

### Product description (Markdown -> sanitized HTML)

- `description` is the source field: it stores product descriptions as Markdown text. When creating or updating a product, send the Markdown in the `description` field (example payload below).
- `descriptionHtml` is an automatically-generated, sanitized HTML version of `description` produced by the server using the same renderer used by the codebase. The API stores `descriptionHtml` in the database so frontends can display ready-to-render HTML without having to re-render on the client.
- For new products and product updates the server will automatically generate and persist `descriptionHtml` from `description`. You should NOT need to send `descriptionHtml` from Postman or the frontend — send `description` (Markdown) and the server does the rest.

Backfill (existing products)

- Products created before this feature was added will have `descriptionHtml = null`. To populate HTML for existing products you can either update each product via the normal update API (server will generate the HTML) or run a short backfill script that renders `description` -> `descriptionHtml` for all products that have a Markdown description but no HTML value.

Example (create/update payload — multipart form for file uploads):

```json
{
  "name": "My Product",
  "description": "# Title\n\nSome **Markdown** description.",
  "price": 12000
}
```

Backfill (CLI example):

```bash
cd apps/api
# ensure prisma client up-to-date
npx prisma generate
# run the backfill script (if provided in this repo)
node -r ts-node/register scripts/backfill-description-html.ts
```

Security notes

- The server sanitizes the rendered HTML before storing it to mitigate XSS risks, but defense-in-depth is recommended: still sanitize or use a safe renderer on the client (e.g. DOMPurify) before inserting HTML into the DOM.
- If you prefer to manage rendering entirely client-side, you can keep only `description` and render on the frontend; storing `descriptionHtml` is an optimization for faster rendering and simpler frontend code.

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

## Wishlists

- GET /api/wishlists (requires authentication + user role)
  - Query params: `page`, `limit`
  - Returns paginated wishlist items for the authenticated user. Each item includes a sanitized `Product` (only the product's primary image is included to keep payload small) and `Variant` if the wishlist was created for a specific variant.

- POST /api/wishlists (requires authentication + user role)
  - Body JSON: `{ "productId": "<PRODUCT_ID>", "variantId": "<VARIANT_ID?" }`
  - Creates a wishlist entry and returns the created item with `id` (useful for later deletes).

- POST /api/wishlists/toggle (requires authentication + user role)
  - Body JSON: `{ "productId": "<PRODUCT_ID>", "variantId": "<VARIANT_ID?" }`
  - Atomically toggles the wishlist entry: if an entry exists (same user/product/variant) it will be deleted, otherwise it will be created. Response shape:
    - `{ "action": "created" | "deleted", "wishlist": { ... } }`
  - Recommended for use on listing pages where frontend wants a single request per click and to avoid race conditions.

- DELETE /api/wishlists/:id (requires authentication + user role)
  - Deletes the wishlist item by id. Useful on the wishlist page where you have the `wishlist.id`.

Example cURL for wishlists:

```bash
# Toggle (create-if-not-exists / delete-if-exists)
curl -X POST "http://localhost:8000/api/wishlists/toggle" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_123"}'

# Create wishlist (detail page)
curl -X POST "http://localhost:8000/api/wishlists" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_123"}'

# Delete wishlist (from wishlist page)
curl -X DELETE "http://localhost:8000/api/wishlists/<WISHLIST_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

- Image in response
  - id, isPrimary, productId, createdAt, updatedAt, imageUrl (no `data` field)

## Carts

- GET /api/carts (requires authentication + user role)
  - Query params: `page`, `limit`
  - Returns paginated cart items for the authenticated user. Each item includes a sanitized `Product` (only the product's primary image is included to keep payload small) and the chosen `Variant` (if any).

- POST /api/carts (requires authentication + user role)
  - Body JSON: `{ "productId": "<PRODUCT_ID>", "variantId": "<VARIANT_ID?>", "quantity": <number?> }`
  - Intended to be called from the product detail page where the user chooses a variant.
  - Behavior:
    - If a cart item for the same user/product/variant already exists, the server will increment its quantity by the provided `quantity` (default 1).
    - Otherwise it will create a new cart item with the provided `quantity` (default 1).

- PATCH /api/carts/:id (requires authentication + user role)
  - Body JSON: `{ "quantity": <number> }` or `{ "delta": <number> }`
  - Use `quantity` to set an absolute quantity, or `delta` to increase/decrease (positive/negative). The server clamps quantity at zero.

- DELETE /api/carts/:id (requires authentication + user role)
  - Deletes the cart item by id.

Example cURL for carts:

```bash
# List carts
curl "http://localhost:8000/api/carts?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"

# Add to cart (from product detail; include variantId when applicable)
curl -X POST "http://localhost:8000/api/carts" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_123","variantId":"var_1","quantity":2}'

# Increment/decrement quantity (delta)
curl -X PATCH "http://localhost:8000/api/carts/<CART_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"delta":-1}'

# Set quantity explicitly
curl -X PATCH "http://localhost:8000/api/carts/<CART_ID>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"quantity":3}'

# Delete cart item
curl -X DELETE "http://localhost:8000/api/carts/<CART_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### Server-side validation (carts)

- Quantity normalization: on create the server treats missing `quantity` as `1`. The server expects a positive integer and will reject non-integer or negative values.
- Stock checks: when a cart item targets a specific `variantId` the server validates the requested quantity does not exceed that variant's available `stock`. Create and update operations will fail with a clear error message if the requested amount is larger than stock.
- Increment behavior: `POST /api/carts` will increment an existing cart item's quantity when the same user/product/variant exists; the resulting quantity is also checked against variant stock.
- Update semantics: `PATCH /api/carts/:id` accepts either `{ "quantity": <number> }` (absolute) or `{ "delta": <number> }` (relative). The server clamps quantities at zero and validates integers.
- Errors: the API returns clear error messages for validation failures (e.g. "Quantity must be at least 1", "Requested quantity exceeds available stock"). Consider mapping these to HTTP 4xx responses (400/409) in the global error handler for best frontend UX.

UX tips:

- Prefetch variant stock on product detail so the UI can prevent invalid quantities client-side and avoid round trips.
- Use optimistic updates but revert on error; show friendly messages when a requested quantity exceeds stock.

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

Database migration (after schema changes)

If you update `schema.prisma` (for example to add `descriptionHtml`), run:

```bash
cd apps/api
npx prisma migrate dev --name add-description-html
npx prisma generate
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

### Variant update rules

- You can rename variants via the `variantUpdates` payload when calling `PATCH /api/products/:id` by providing the variant's `id` and a new `variant` value:

  ```json
  { "variantUpdates": [{ "id": "var_abc", "variant": "XS", "stock": 5 }] }
  ```

- Validation and constraints:
  - The database enforces `@@unique([productId, variant])`, so renaming to a name that already exists for the same product will be rejected.
  - The API performs server-side validation to catch duplicate names in the incoming payload and against existing variants. If a duplicate is detected the API will return an error with a clear message (considered a 409 Conflict at the HTTP layer).
  - If an update payload omits `id` for a variant entry, the server will create a new variant for that product.

- Recommended client behavior:
  - Resolve variant `id`s on the frontend when possible (prefetch variants for the product) and send `id` for updates.
  - Use friendly UI validation to prevent the user from entering a name that already exists for the product.

Questions or want me to add a short test harness or Postman collection before we pause? I can add one next.
