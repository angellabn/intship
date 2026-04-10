# 👥 Customer Management Module

A full-stack web application for managing customer accounts — built with **Node.js**, **Express**, **MySQL**, and vanilla **HTML/CSS/JS**.

> **Assignment Submission** — Web Application Development

---

## 🚀 Live Demo

**Hosted on:** https://customer-mgmt-module.onrender.com

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin@123 |
| Customer | rahul@example.com | Customer@123 |

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Add a New Customer** | Customers self-register via frontend; Admins manually add via dashboard |
| 2 | **Customer Dashboard** | Admin views all customers — name, email, phone, status, joined date |
| 3 | **Update Customer Details** | Admins edit any customer; Customers edit their own profile |
| 4 | **Delete / Deactivate Account** | Soft delete — sets `status = FALSE`, data preserved in DB |

---

## 🗄️ Database Design

**Table: `users`**

| Column | Datatype | Description |
|--------|----------|-------------|
| user_id | INT (PK, AUTO_INCREMENT) | Unique identifier for each customer |
| first_name | VARCHAR(100) | Customer's first name |
| last_name | VARCHAR(100) | Customer's last name |
| email | VARCHAR(100) UNIQUE | Customer's email address |
| phone | VARCHAR(15) | Customer's phone number |
| password | VARCHAR(255) | Bcrypt-hashed password |
| created_at | DATETIME | Timestamp when account was created |
| updated_at | DATETIME | Timestamp when details were last updated |
| status | BOOLEAN | TRUE = active, FALSE = inactive (soft delete) |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL 8
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Auth:** JWT + bcryptjs
- **Hosting:** Render.com (free tier)

---

## ⚙️ Local Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/customer-management-module.git
cd customer-management-module

# 2. Install
npm install

# 3. Database — run in MySQL client
mysql -u root -p < db/schema.sql

# 4. Configure
cp .env.example .env
# Edit .env with your DB credentials

# 5. Start
npm run dev    # http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/admin/login` | — | Admin login |
| POST | `/api/auth/register` | — | Customer self-registration |
| POST | `/api/auth/login` | — | Customer login |
| GET | `/api/customers` | ✅ | List customers (admin: all, customer: own) |
| GET | `/api/customers/:id` | ✅ | Get single customer |
| POST | `/api/customers` | Admin | Admin adds customer manually |
| PUT | `/api/customers/:id` | ✅ | Update customer details |
| DELETE | `/api/customers/:id` | Admin | Soft deactivate account |
| PATCH | `/api/customers/:id/reactivate` | Admin | Reactivate account |

---

## 📁 Project Structure

```
customer-management-module/
├── server.js
├── routes/
│   ├── auth.js          # Login & Register
│   └── customers.js     # Customer CRUD
├── middleware/
│   └── auth.js          # JWT middleware
├── db/
│   ├── connection.js
│   └── schema.sql       # DB + seed data
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── .env.example
├── package.json
└── README.md
```

---

## 🚢 Deploy on Render.com (Free)

1. Push to GitHub
2. Render → New Web Service → connect repo
3. Build: `npm install` | Start: `node server.js`
4. Add env vars (DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET)
5. Use [Aiven.io](https://aiven.io) for free MySQL

---

*Submitted as part of Web Application Development Assignment.*
