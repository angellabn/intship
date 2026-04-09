# 📦 Order Management Module

A full-stack web application for managing customer orders — built with **Node.js**, **Express**, **MySQL**, and vanilla **HTML/CSS/JS**.

> **Assignment Submission** — Web Application Development

---

## 🚀 Live Demo

**Hosted on:** https://order-mgmt-module.onrender.com

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin@123 |
| Customer | customer@demo.com | Customer@123 |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🛒 Place Order | Customers select products, view price + GST, enter address and checkout |
| 📋 Order Dashboard | Admins view all orders with filters by status, search by name/address/ID |
| 🔄 Update Order Status | Admins update status: Pending → Shipped → Delivered / Cancelled |
| ❌ Cancel Order | Customers/Admins cancel pending orders (soft delete — data preserved) |
| 🔒 Auth | JWT-based login/register for Customers and Admins |

---

## 🗄️ Database Design

**Table: `orders`**

| Column | Datatype | Description |
|--------|----------|-------------|
| user_id | INT (PK, AUTO_INCREMENT) | Unique order identifier |
| customer_id | INT (FK) | References users table |
| total_amount | DECIMAL(10,2) | Total order cost |
| order_status | VARCHAR(50) | Pending / Shipped / Delivered / Cancelled |
| shipping_address | VARCHAR(300) | Delivery address |
| created_at | DATETIME | Order placement timestamp |
| updated_at | DATETIME | Last update timestamp |
| status | BOOLEAN | TRUE = active, FALSE = cancelled (soft delete) |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL 8
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Hosting:** Render.com (free tier)

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/order-management-module.git
cd order-management-module
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
# Create DB and tables — run this in your MySQL client
mysql -u root -p < db/schema.sql
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials
```

### 5. Start the server
```bash
npm run dev    # development (with auto-reload)
npm start      # production
```

Open **http://localhost:3000** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/orders` | List orders (admin: all, customer: own) |
| GET | `/api/orders/:id` | Get single order with items |
| POST | `/api/orders` | Place new order |
| PATCH | `/api/orders/:id/status` | Update order status (admin only) |
| DELETE | `/api/orders/:id` | Cancel / soft-delete order |
| GET | `/api/orders/products/list` | List all products |

---

## 📁 Project Structure

```
order-management-module/
├── server.js              # Express app entry point
├── routes/
│   ├── auth.js            # Login & Register
│   └── orders.js          # All order CRUD routes
├── middleware/
│   └── auth.js            # JWT verification
├── db/
│   ├── connection.js      # MySQL pool
│   └── schema.sql         # Database DDL + seed data
├── public/
│   ├── index.html         # Single-page frontend
│   ├── css/style.css      # Stylesheet
│   └── js/app.js          # Frontend logic
├── .env.example
├── package.json
└── README.md
```

---

## 🚢 Deploying to Render.com (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Build Command:** `npm install`
5. Set **Start Command:** `node server.js`
6. Add Environment Variables: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`
7. Use [Aiven.io](https://aiven.io) or [Railway.app](https://railway.app) for free MySQL
8. Deploy!

---

## 👨‍💻 Author

Submitted as part of Web Application Development Assignment.
