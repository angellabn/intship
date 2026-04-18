# 💳 Payment Management Module

A full-stack Payment Management Module built with **Node.js + Express + MySQL** (backend) and **React** (frontend).

## Features
- 🔐 Admin authentication (JWT)
- 💸 Process payments via Credit Card, PayPal, Bank Transfer
- 📊 Payment dashboard with stats & charts
- ↩️ Issue refunds for cancelled/returned orders
- 📦 Order management with status updates
- 📄 Paginated & filterable transaction history

## Tech Stack
| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React 18, React Router, Recharts |
| Backend  | Node.js, Express.js         |
| Database | MySQL 8                     |
| Auth     | JWT + bcryptjs              |
| Payments | Stripe API                  |

## Project Structure
```
payment-module/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection & SQL schema
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth middleware
│   │   └── routes/       # API routes
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/   # Layout, ProtectedRoute
    │   ├── context/      # AuthContext
    │   ├── pages/        # Dashboard, Payments, Process, Orders
    │   └── services/     # Axios API calls
    └── package.json
```

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/payment-management-module.git
cd payment-management-module
```

### 2. Set up the database
```bash
mysql -u root -p < backend/src/config/schema.sql
```

### 3. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm install
npm run dev
```

### 4. Start frontend
```bash
cd frontend
npm install
npm start
```

### 5. Login
- URL: `http://localhost:3000`
- Email: `admin@payment.com`
- Password: `admin123`

## API Endpoints

| Method | Endpoint                      | Description              | Auth   |
|--------|-------------------------------|--------------------------|--------|
| POST   | /api/auth/login               | Admin login              | No     |
| GET    | /api/payments                 | List all payments        | Admin  |
| GET    | /api/payments/stats           | Dashboard statistics     | Admin  |
| GET    | /api/payments/:id             | Get payment by ID        | Admin  |
| POST   | /api/payments/process         | Process a payment        | No     |
| POST   | /api/payments/:id/refund      | Issue refund             | Admin  |
| GET    | /api/orders                   | List all orders          | Admin  |
| POST   | /api/orders                   | Create new order         | No     |
| PATCH  | /api/orders/:id/status        | Update order status      | Admin  |

## Deployment

### Backend — Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env.example`

### Frontend — Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Set `REACT_APP_API_URL` env var to your Render backend URL
4. Deploy

## Database Schema

```sql
CREATE TABLE payments (
  payment_id     INT PRIMARY KEY AUTO_INCREMENT,
  order_id       INT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid',
  transaction_ref VARCHAR(100),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

## License
MIT
