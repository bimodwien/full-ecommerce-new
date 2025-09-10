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

````bash
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
# full-ecommerce-new

Monorepo with a Next.js frontend and an Express + Prisma API. This README is aligned to the features implemented in the API (product read/create/update/delete, image rendering, Markdown -> sanitized HTML description, wishlist, cart).

## TL;DR
- For product create/update send `description` (Markdown). The server automatically renders and persists `descriptionHtml` (sanitized HTML) and the frontend can render `descriptionHtml` safely (still sanitize on client as defense-in-depth).
- Product list endpoints intentionally do NOT include `description` or `descriptionHtml`. Use product detail to fetch them.
- Wishlist and Cart endpoints are available and covered below. Order service is not created.

## What this API implements
- Product read (paginated list, filtering, sorting) and product detail.
- Product create/update/delete with images and variants.
- Image processing using `sharp` (stored as PNG bytes) and an image renderer endpoint that streams images with caching headers (ETag, Last-Modified, Cache-Control).
- Markdown -> sanitized HTML: backend uses `markdown-it` + `sanitize-html` to produce `descriptionHtml` from `description` on create/update.
- Responses are sanitized: raw image bytes (`ProductImage.data`) are removed and each image object includes an `imageUrl` to fetch the image.
- Wishlist CRUD + toggle endpoint (atomic toggle semantics).
- Cart CRUD with server-side quantity normalization and variant stock validation.

## Important decision notes
- List endpoints (GET /api/products, GET /api/products/category/:categoryId) return only minimal product data (no description, only primary image) to keep payloads small.
- Product detail (GET /api/products/:id) returns full information, including `description` (Markdown source) and `descriptionHtml` (sanitized HTML).

## Endpoints (summary)

Products
- GET /api/products?page=&limit=&name=&categoryId=&minPrice=&maxPrice=&sort=
  - Returns paginated products (no descriptions). Primary image only.
- GET /api/products/:id
  - Returns full product (all images, variants, description, descriptionHtml).
- POST /api/products (multipart/form-data) — create product (auth required)
  - Fields: name (required), description (Markdown), price (required), categoryId, variant (JSON array/string), image files (`image` form field)
- PATCH /api/products/:id (multipart/form-data) — update (auth required)
  - Same fields as create. Optional: `removeImageIds`, `variantUpdates` (array), `removeVariantIds`.
- DELETE /api/products/:id (auth required)

Images
- GET /api/products/image/:id
  - Streams image by ProductImage.id or falls back to a product's primary image if you pass a product id. Sets ETag and Last-Modified.

Wishlists
- GET /api/wishlists?page=&limit= (auth)
- POST /api/wishlists — create (auth)
  - Body: { productId, variantId? }
- POST /api/wishlists/toggle — toggle (auth)
  - Body: { productId, variantId? } — returns { action: 'created'|'deleted', wishlist }
- DELETE /api/wishlists/:id (auth)

Carts
- GET /api/carts?page=&limit= (auth)
- POST /api/carts — add/increment (auth)
  - Body: { productId, variantId?, quantity? } (quantity defaults to 1)
- PATCH /api/carts/:id — update (auth)
  - Body: { quantity } (absolute) or { delta } (relative)
- DELETE /api/carts/:id (auth)

Notes: Cart create/update enforces variant stock and validates integers.

## How to test (Postman / curl)

1) Authentication
- Most endpoints require an authenticated user. In Postman set an environment variable `{{API_BASE}}` (e.g. `http://localhost:8000`) and `{{AUTH_TOKEN}}` for a user's JWT.
- Add header: `Authorization: Bearer {{AUTH_TOKEN}}` to requests that require auth.

2) Wishlist examples (Postman)
- Toggle wishlist (recommended):
  - Method: POST
  - URL: {{API_BASE}}/api/wishlists/toggle
  - Body: raw JSON `{ "productId": "<PRODUCT_ID>", "variantId": "<VARIANT_ID?>" }`

- Create wishlist (explicit):
  - POST {{API_BASE}}/api/wishlists
  - Body: `{ "productId": "<PRODUCT_ID>" }`

- List wishlists:
  - GET {{API_BASE}}/api/wishlists?page=1&limit=10

3) Cart examples (Postman)
- Add to cart / increment:
  - POST {{API_BASE}}/api/carts
  - Body: `{ "productId": "<PRODUCT_ID>", "variantId": "<VARIANT_ID?>", "quantity": 2 }`

- Update cart quantity:
  - PATCH {{API_BASE}}/api/carts/<CART_ID>
  - Body: `{ "quantity": 3 }` or `{ "delta": -1 }`

- List carts:
  - GET {{API_BASE}}/api/carts?page=1&limit=10

Quick curl examples
```bash
# Toggle wishlist
curl -X POST "${API_BASE:-http://localhost:8000}/api/wishlists/toggle" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_123"}'

# Add to cart
curl -X POST "${API_BASE:-http://localhost:8000}/api/carts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_123","variantId":"var_1","quantity":2}'
````

## Create / Update product (notes)

- Send `description` as Markdown. The server will render and sanitize HTML and persist it to `descriptionHtml`.
- Product list endpoints intentionally do not include `description` or `descriptionHtml` — use product detail for full content.

Example multipart create (curl)

```bash
curl -X POST "http://localhost:8000/api/products" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=My Product" \
  -F "price=12000" \
  -F "description=# Title\n\nSome markdown text" \
  -F "variant=[{\"variant\":\"S\",\"stock\":10}]" \
  -F "image=@./images/1.jpg"
```

## Backfill existing products

If you added `descriptionHtml` later, existing products may have `descriptionHtml = null`. To populate it for all existing products you can either update products via the API or run a backfill script.

Backfill (example):

```bash
cd apps/api
npx prisma generate
# run the backfill script (if present)
node -r ts-node/register scripts/backfill-description-html.ts
```

## Developer notes

- Files of interest:
  - `apps/api/src/services/product.service.ts` — read operations and image render helper
  - `apps/api/src/services/product.business.service.ts` — create/update/delete business logic (image processing, variant handling)
  - `apps/api/src/services/product.helpers.ts` — sanitizers used by list and detail responses
  - `apps/api/src/libs/markdown.ts` — server-side markdown render + sanitize helper
  - `apps/api/prisma/schema.prisma` — DB schema (includes `descriptionHtml`)

- TypeScript & Prisma:
  - After changing `schema.prisma` run `npx prisma migrate dev` and `npx prisma generate` to update client types.
  - We temporarily used casts while types were regenerating; these have been cleaned up.

## Security

- The server sanitizes rendered HTML before persisting it. Still sanitize again on the client before injecting HTML (use DOMPurify) as defense-in-depth.

## Next steps (suggested)

- Add a small Postman collection to the repo for quick QA (I can add it if you want).
- Add integration tests for product create/update/delete and wishlist/cart flows (supertest + jest).
- Consider moving images to object storage (S3) for scale.

If you'd like, I can add a Postman collection and an npm script for backfill (`backfill:descriptionHtml`). Tell me which you prefer and I'll add them.
