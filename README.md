# 🛒 Full E-Commerce

A full-stack e-commerce marketplace with a **real payment gateway integration** — buyers browse and checkout through Midtrans, sellers manage products and fulfil orders through a dedicated dashboard.

Built as a Turborepo monorepo: **Next.js 16** frontend + **Express 5 / Prisma 7** API.

<!-- TODO: isi link demo kalau sudah dideploy -->
<!-- **🔗 [Live Demo](https://your-demo-url.com)** · **[API](https://your-api-url.com)** -->

<!-- TODO: taruh screenshot/GIF di sini — paling ideal: GIF flow checkout sampai Midtrans Snap popup -->
<!-- ![Homepage](docs/screenshots/homepage.png) -->

---

## Why this project

Most portfolio e-commerce apps stop at a fake "Pay" button that flips a status column. This one doesn't:

- **Real Midtrans Snap integration** — orders are paid through the actual Midtrans sandbox, and payment state is settled by a **server-to-server webhook**, not by trusting the client.
- **Manually verified webhook signatures** (SHA-512 over `order_id + status_code + gross_amount + server_key`) instead of accepting any POST that reaches the endpoint.
- **Idempotent notification handling** — a replayed or out-of-order Midtrans callback is a no-op, because payment providers *do* retry.
- **Stock is managed transactionally** — reserved when an order is created, restored inside a DB transaction when it's cancelled, denied, or expires.

The interesting code lives in [`apps/api/src/services/order.service.ts`](apps/api/src/services/order.service.ts) and [`apps/api/src/libs/midtrans.ts`](apps/api/src/libs/midtrans.ts).

---

## Features

### Buyer
- Browse products with pagination, search, category filter, and price sorting
- Product detail with image gallery and variant selection
- Wishlist with atomic toggle (single request per click — no double-fire race)
- Cart with server-side quantity normalisation and per-variant stock validation
- Checkout through Midtrans Snap, with **retry payment** for unpaid orders
- Order history and detail, with "Complete Order" and "Submit Return" actions
- Auth via email/password with JWT

### Seller
- Product CRUD with multi-image upload and variant management
- Category CRUD
- Rich-text (Markdown) product descriptions via a TipTap editor
- Order tracking dashboard — view all orders, mark as shipped, cancel stale unpaid orders

---

## Order lifecycle

```
                    ┌──────────────── Midtrans webhook ────────────────┐
                    │                                                  │
   create order     ▼                    seller                buyer   │
  ──────────────► PENDING ──── paid ──► PAID ──── ship ──► SHIPPED ──┬──► COMPLETED
                    │                                                │
                    │                                                └──► RETURNED
                    └──► CANCELLED  (expire/deny via webhook, or seller cancel after 24h)
```

**Design note — why the 24-hour cancel gate:** while an order is `PENDING` the buyer can *always* still pay, because "Pay Now" mints a fresh Snap token on every attempt. Cancelling is therefore what actually *closes* the payment window, so it's gated to orders old enough that Midtrans' own window has lapsed. Cancellation restores stock and re-reads the order **inside** the transaction, since the webhook could be settling it concurrently.

---

## Tech stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Redux Toolkit, shadcn/ui + Radix, Formik + Yup, TipTap, Sonner, DOMPurify

**Backend** — Express 5, TypeScript, Prisma 7 (PostgreSQL), JWT, bcrypt, Midtrans Client, Multer + Sharp, markdown-it + sanitize-html, Google Auth Library

**Tooling** — Turborepo, ESLint, Prettier, Husky + lint-staged + commitlint, GitHub Actions (auto-deploy to Linode via PM2)

---

## Project structure

```
.
├── apps
│   ├── api                    # Express + Prisma backend
│   │   ├── prisma/            # schema + migrations
│   │   └── src
│   │       ├── routers/       # route definitions + guards
│   │       ├── controllers/   # request/response handling
│   │       ├── services/      # business logic
│   │       ├── middlewares/   # auth (JWT) + role (buyer/seller) guards
│   │       └── libs/          # midtrans, multer, markdown, AppError
│   └── web                    # Next.js frontend
│       └── src
│           ├── app/           # App Router pages
│           ├── components/    # feature components + shadcn/ui
│           ├── libraries/     # Redux store
│           └── helpers/       # API fetchers
└── turbo.json
```

The backend is layered **router → controller → service**; product logic is further split into `product.service` (reads), `product.business.service` (writes), and `product.helpers` (shared sanitisers).

---

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL
- A [Midtrans sandbox account](https://dashboard.sandbox.midtrans.com/) (for the payment flow)

### 1. Install

```bash
git clone <your-repo-url>
cd full-ecommerce-new
npm install
```

### 2. Configure environment

Copy the example files and fill in your own values — each variable is documented inline:

```bash
cp apps/api/.env.example apps/api/.env.development
cp apps/web/.env.example apps/web/.env.local
```

At minimum you'll need to set `DATABASE_URL`, `SECRET_KEY`, and your Midtrans sandbox keys. The Midtrans **client** key goes in both files; the **server** key stays in the API only.

### 3. Set up the database

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 4. Run

```bash
npm run dev          # runs both apps via Turborepo
```

- Web → http://localhost:3000
- API → http://localhost:8000

### 5. Testing the payment webhook locally

Midtrans needs a publicly reachable URL to deliver payment notifications, so local testing requires a tunnel:

```bash
ngrok http 8000
```

Then set **Midtrans Dashboard → Settings → Configuration → Payment Notification URL** to:

```
https://<your-ngrok-domain>/api/orders/notification
```

Without this, orders stay `PENDING` after payment — the Snap popup will succeed, but nothing tells your API about it.

---

## API reference

Base URL: `http://localhost:8000/api`

Auth: `Authorization: Bearer <token>`. Routes are guarded in two tiers — `validateToken` (valid JWT) then `verifyUser` (buyer) or `verifyAdmin` (seller).

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/users/register` | Public | Register a new account |
| `POST` | `/users/login` | Public | Log in, returns JWT |
| `POST` | `/users/google` | Public | Google Sign-In (`{ id_token }`) — implemented, UI not yet wired |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Public | Paginated list — `page`, `limit`, `name`, `categoryId`, `minPrice`, `maxPrice`, `sort` (`newest\|price_asc\|price_desc`) |
| `GET` | `/products/:id` | Public | Full detail — all images, variants, `descriptionHtml` |
| `GET` | `/products/category/:categoryId` | Public | Category-filtered list |
| `GET` | `/products/image/:id` | Public | Streams image bytes (ETag / Last-Modified / Cache-Control) |
| `POST` | `/products` | Seller | Create — `multipart/form-data`, up to 5 `image` files |
| `PATCH` | `/products/:id` | Seller | Update — also accepts `removeImageIds`, `variantUpdates`, `removeVariantIds` |
| `DELETE` | `/products/:id` | Seller | Delete |

### Categories
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | Paginated list — `page`, `limit`, `name` |
| `GET` | `/categories/:id` | Public | Get one |
| `POST` · `PUT` · `DELETE` | `/categories[/:id]` | Seller | Create / update / delete |

### Cart & Wishlist
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/carts` | Buyer | Paginated cart items |
| `POST` | `/carts` | Buyer | Add or increment — `{ productId, variantId?, quantity? }` |
| `PATCH` | `/carts/:id` | Buyer | Update — `{ quantity }` (absolute) or `{ delta }` (relative) |
| `DELETE` | `/carts/:id` | Buyer | Remove item |
| `GET` | `/wishlists` | Buyer | Paginated wishlist |
| `POST` | `/wishlists/toggle` | Buyer | Atomic toggle → `{ action: 'created' \| 'deleted', wishlist }` |
| `POST` · `DELETE` | `/wishlists[/:id]` | Buyer | Explicit create / delete |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | Buyer | Create order from selected cart items (`{ cartItemIds }`) — reserves stock, returns Snap token |
| `GET` | `/orders` | Buyer | Own order history |
| `GET` | `/orders/:id` | Buyer | Own order detail |
| `POST` | `/orders/:id/retry-payment` | Buyer | Mint a fresh Snap token for an unpaid order |
| `PATCH` | `/orders/:id/complete` | Buyer | `SHIPPED` → `COMPLETED` |
| `PATCH` | `/orders/:id/return` | Buyer | `SHIPPED` → `RETURNED` (with reason) |
| `GET` | `/orders/admin` | Seller | All orders, filterable by status |
| `PATCH` | `/orders/:id/ship` | Seller | `PAID` → `SHIPPED` |
| `PATCH` | `/orders/:id/cancel` | Seller | Cancel a stale `PENDING` order, restore stock |
| `POST` | `/orders/notification` | **Midtrans** | Payment webhook — verified by signature, not JWT |

---

## Engineering notes

**Payment webhook is the source of truth.** The client never tells the API that a payment succeeded — the frontend only opens the Snap popup. Order status changes exclusively through the signed webhook, so a user can't mark their own order as paid from devtools.

**Markdown descriptions, sanitised server-side.** Products store `description` as Markdown; the API renders and sanitises it into `descriptionHtml` on write (`markdown-it` + `sanitize-html`), so the frontend gets ready-to-render HTML without re-parsing per request. The client still runs DOMPurify before injecting it — defense in depth.

**Payload shaping.** List endpoints deliberately return only a primary image and no description, keeping catalogue responses small; the detail endpoint returns everything. Raw image bytes are always stripped from JSON — every image is exposed as an `imageUrl` pointing at the streaming endpoint, which sets proper cache headers.

**Images live in Postgres as `Bytes`,** processed to PNG with Sharp on upload. This keeps the project self-contained with no external storage dependency — a deliberate trade-off that would be swapped for S3/Cloudinary before any real scale.

---

## Known limitations & roadmap

Being upfront about what isn't done:

- [ ] **Test coverage is minimal** — the payment and order lifecycle logic is the priority here
- [ ] No cron/safety-net to auto-expire orders stuck in `PENDING` (currently a manual seller action)
- [ ] Refresh tokens are issued but there's no refresh endpoint wired up; no logout or password reset
- [ ] No rate limiting or `helmet` on the API
- [ ] Images should move to object storage before production scale
- [ ] Deploy pipeline uses SSH password auth — should be key-based

---

## License

ISC
