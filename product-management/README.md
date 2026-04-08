# Product Management Module

A full-stack web application to manage e-commerce product inventory.

## Tech Stack
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js + Express.js
- **Database:** MySQL

## Project Structure
```
product-management/
├── backend/
│   ├── server.js        ← Express API server
│   ├── database.sql     ← MySQL setup script
│   ├── package.json
│   └── .env.example     ← Copy to .env and fill in DB credentials
├── frontend/
│   └── public/
│       └── index.html   ← Complete frontend (single file)
└── README.md
```

## Setup Instructions

### 1. Setup MySQL Database
```sql
mysql -u root -p < backend/database.sql
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Install Dependencies & Start Server
```bash
cd backend
npm install
npm start
```

### 4. Open the App
Open `frontend/public/index.html` in your browser, or visit `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products (supports ?search, ?status, ?category_id) |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Add new product |
| PUT | /api/products/:id | Update product |
| PATCH | /api/products/:id/status | Toggle active/inactive |
| DELETE | /api/products/:id | Delete product |
| GET | /api/categories | List all categories |
| GET | /api/stats | Dashboard summary stats |
