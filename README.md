<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/mongodb/mongodb.png" width="100" alt="MongoDB" />
</p>

<h1 align="center">E-Commerce RESTful API</h1>

<p align="center">
  A production-style <strong>E-Commerce Backend API</strong> built with <strong>NestJS</strong> and <strong>MongoDB (Mongoose)</strong>.
  Implements full authentication, role-based access control, product catalog, shopping cart with coupons, reviews &amp; ratings, suppliers, and more.
</p>

---

## Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Runtime    | Node.js + TypeScript                                              |
| Framework  | NestJS 11 (modular architecture, dependency injection)            |
| Database   | MongoDB + Mongoose 8 (ODM, schemas, indexes, population)          |
| Auth       | JWT (stateless tokens) + bcrypt (password hashing)                |
| Emails     | Nodemailer / @nestjs-modules/mailer (password reset codes)        |
| Validation | class-validator + class-transformer (global DTO validation)       |
| Testing    | Jest + Supertest (unit & e2e tests)                               |
| Tooling    | ESLint, Prettier, SWC loader, ts-jest                             |

## Features

### 🔐 Authentication & Users
- **Sign up / Sign in** with JWT access tokens (`expiresAt` timestamp returned for the frontend)
- **Passwords hashed with bcrypt** (10 salt rounds) — never stored in plain text
- **Password reset flow**: generate a 6-digit verification code → send it by **email (HTML template)** → verify within 10 minutes → change password
- **Role-based access control (RBAC)** with custom `@Roles()` decorator and global `AuthGuard`
- Admin-only user management (create / read / update / delete) and user self-service endpoints (`/user-me`)
- Safe user serialization (password and internal fields stripped from responses)

### 🛍️ Catalog
- **Products** with categories, sub-categories, brands, price & price-after-discount validation, stock quantity, images and colors
- **Advanced querying**:
  - Pagination (`page`, `limit`) with total pages / item count metadata
  - Sorting (multi-field, ascending/descending)
  - Field selection (`fields`)
  - Numeric range filters (`price[gte]=…`, `lte`, `gt`, `lt`)
  - Keyword full-text / regex search on title & description
  - Cross-collection reference **population** (category, sub-category, brand names)
- **MongoDB indexes** for performance: compound indexes on `(category, brand)` and `(price, ratingsAverage)`, plus a **text index** on title/description
- **Reviews & ratings**: one review per user per product (compound unique index), automatic product `ratingsAverage` / `ratingsQuantity` recalculation on create / update / delete

### 🛒 Cart & Discounts
- Per-user cart with items (product, quantity, color) and automatic **total price** calculation (respects price-after-discount)
- Stock-aware quantity updates and out-of-stock guards
- **Coupon system**: create / validate / expire coupons, apply discount to cart total, one-time use per cart

### 🏭 Admin / Operations
- **Categories & Sub-categories** and **Brands** (unique-name enforcement, `ConflictException` on duplicate keys)
- **Suppliers** CRUD
- **Product requests**: users request new products, with ownership checks and duplicate-title prevention
- **Tax / shipping configuration**: singleton configuration document (create-or-update, reset)

### 🧱 Engineering Quality
- **Global `ValidationPipe`** with `whitelist`, `forbidNonWhitelisted` and `transform` — strips unknown fields and rejects invalid payloads
- **Consistent API response envelope** (`AppResponse<T>`) with status, message, data and pagination metadata
- Standard NestJS exception handling (`NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`, `UnauthorizedException`)
- API versioned under the global prefix **`/api/v1`**
- `ParseObjectIdPipe` validation on Mongo `ObjectId` params
- Environment configuration via `@nestjs/config` (`.env`)

## Project Structure

```
src/
├── auth/                 # Sign-up, sign-in, password reset (email codes)
├── user/                 # User CRUD, guards, roles & payload decorators
├── product/              # Product CRUD + advanced filtering/sorting/pagination
├── category/             # Categories
├── sub-category/         # Sub-categories
├── brand/                # Brands
├── review/               # Reviews & auto-updating product ratings
├── cart/                 # Shopping cart, totals & coupon application
├── coupon/               # Discount coupons (expiry validation)
├── supplier/             # Suppliers CRUD
├── request-product/      # User product requests
├── tax/                  # Tax & shipping singleton configuration
└── utils/                # Shared AppResponse / pagination envelope
```

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB running locally (default: `mongodb://localhost:27017/ecommerce`) or a remote URI

### Installation

```bash
$ npm install
```

### Environment Variables

Create a `.env` file based on the following variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_HOST=your_email_host
```

### Running the app

```bash
# development (watch mode)
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Main Endpoints (prefix: `/api/v1`)

| Method | Endpoint                     | Access | Description                          |
| ------ | ---------------------------- | ------ | ------------------------------------ |
| POST   | `/auth/sign-up`              | Public | Register and get a JWT token         |
| POST   | `/auth/sign-in`              | Public | Login and get a JWT token            |
| POST   | `/auth/reset-password`       | Public | Send verification code by email      |
| POST   | `/auth/verify-code`          | Public | Verify the 6-digit code (10 min)     |
| POST   | `/auth/change-password`      | Public | Set a new password                   |
| GET    | `/products?page=&limit=&sort=&fields=&keyword=&price[gte]=` | Public | Search / filter / paginate products |
| POST   | `/products`                  | Admin  | Create a product                     |
| GET    | `/categories`                | Public | List categories                      |
| POST   | `/reviews`                   | User   | Review a product                     |
| POST   | `/carts/:productId`          | User   | Add product to cart                  |
| POST   | `/carts/coupon/:couponName`  | User   | Apply a coupon to the cart           |
| GET    | `/carts/my-cart`             | User   | Get current user's cart              |
| GET    | `/user-me`                   | User   | Get own profile                      |
| GET    | `/users`                     | Admin  | List all users                       |

> Authenticated endpoints expect: `Authorization: Bearer <token>`

## Highlights (for recruiters)

- **MongoDB with Mongoose** end-to-end: schema design with decorators, `ObjectId` references, `populate()`, compound and text indexes, unique constraints, and document-level transactions-free but index-optimized queries.
- **Clean NestJS modular architecture**: 12 feature modules, dependency injection, guards, custom decorators, and a shared response utility.
- **Security-minded**: bcrypt hashing, JWT verification with dedicated expired/invalid token handling, RBAC, payload whitelisting, and sensitive-field exclusion from responses.
- **API design**: consistent envelope + pagination metadata, versioned routes, expressive error codes — ready for frontend integration.

## License

This project is for portfolio / demonstration purposes.
