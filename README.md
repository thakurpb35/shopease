# ShopEase – E-Commerce Website

A full-stack online store built with the **MERN stack** (MongoDB, Express, React, Node.js) and Bootstrap 5.
Customers can browse, search, add products to a cart and place orders. Admins manage products and orders from a separate admin panel.

## Features

**Customers**
- Product listing with search, category filter, sorting and pages
- Product details with stock status ("Only 3 left", "Out of stock")
- Shopping cart that is saved in the browser
- Sign up / log in (JWT), checkout with a delivery address, **Cash on Delivery**
- "My orders" page with order status and cancelling (while the order has not shipped)

**Admin panel** (role-based access)
- Dashboard: revenue, orders, products, customers, orders by status, low-stock list, recent orders
- Add, edit and delete products
- View all customer orders and move them through *placed → shipped → delivered* (or cancel)

**Back end**
- REST APIs for users, products and orders
- Roles: `customer` and `admin`. Admin-only routes return 403 for everyone else
- Passwords are hashed with bcrypt, logins use JWT tokens
- Order totals are calculated on the server from database prices, never trusted from the browser
- Stock is reduced safely when an order is placed and put back when it is cancelled

## Tech stack

| Part | Technology |
| --- | --- |
| Front end | React 18, Vite, React Router, Bootstrap 5 |
| Back end | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB (local or MongoDB Atlas) |
| Auth | JSON Web Tokens (JWT), bcryptjs |

## Project structure

```
shopease/
├── client/                React app (Vite)
│   └── src/
│       ├── pages/         Shop, ProductDetail, Cart, Checkout, Orders, Login, Register
│       │   └── admin/     Dashboard, Products, ProductForm, AdminOrders
│       ├── components/    Navbar, ProductCard, Pagination, ProtectedRoute ...
│       ├── context/       AuthContext (login state), CartContext (cart)
│       └── api.js         All calls to the back end
└── server/                Express API
    └── src/
        ├── models/        User, Product, Order
        ├── routes/        auth, products, orders, admin
        ├── middleware/    auth (login check) and adminOnly (role check)
        ├── seed.js        Creates the admin account and sample products
        └── index.js
```

## Run it on your computer

You need **Node.js 18 or newer** and a MongoDB database (either MongoDB installed on your computer, or a free MongoDB Atlas cluster).

### 1. Back end

```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `server/.env` and set:
- `MONGO_URI` – your MongoDB address (local: `mongodb://127.0.0.1:27017/shopease`)
- `JWT_SECRET` – any long random text. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – the admin login that will be created (change the password)

Then add the admin account and sample products, and start the server:

```bash
npm run seed
npm start                   # API on http://localhost:5002
```

### 2. Front end (a second terminal)

```bash
cd client
npm install
npm run dev                 # website on http://localhost:5174
```

Open **http://localhost:5174**. Log in with the admin email and password from your `.env` (default `admin@shopease.com` / `admin123`) to see the **Admin** menu. Anyone who signs up on the website becomes a normal customer.

> The ports are 5002 (API) and 5174 (website), so ShopEase can run next to a project that uses 5001 / 5173.

### Optional: run everything from one server

```bash
cd client && npm run build
cd ../server && npm start   # now http://localhost:5002 serves the website too
```

## Environment variables (`server/.env`)

| Name | Purpose | Default |
| --- | --- | --- |
| `PORT` | API port | `5002` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/shopease` |
| `JWT_SECRET` | Secret used to sign login tokens (required) | – |
| `ADMIN_EMAIL` | Admin account created by `npm run seed` | `admin@shopease.com` |
| `ADMIN_PASSWORD` | Password for that admin | `admin123` |

`.env` is listed in `.gitignore`, so your passwords are never uploaded to GitHub.

## API overview

| Method | Route | Who | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | anyone | Create a customer account |
| POST | `/api/auth/login` | anyone | Log in, returns a token |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/products` | anyone | List products (`search`, `category`, `sort`, `page`, `limit`) |
| GET | `/api/products/categories` | anyone | List categories |
| GET | `/api/products/:id` | anyone | One product |
| POST / PUT / DELETE | `/api/products`, `/api/products/:id` | **admin** | Add, edit, delete a product |
| POST | `/api/orders` | logged in | Place an order |
| GET | `/api/orders/mine` | logged in | My orders |
| PATCH | `/api/orders/:id/cancel` | logged in | Cancel my order (only while "placed") |
| GET | `/api/orders` | **admin** | All orders (`status` filter) |
| PATCH | `/api/orders/:id/status` | **admin** | Change an order's status |
| GET | `/api/admin/stats` | **admin** | Numbers for the dashboard |

## Notes

- Payment is Cash on Delivery only. There is no online payment gateway.
- Products can have an optional image link. Without one, the shop shows a coloured tile with a category emoji.
