# 🛒 Cart Management Module

A **Spring Boot + MySQL** REST API for managing shopping carts in an e-commerce application.

---

## 📋 Features

- ✅ Add products to cart (with stock validation)
- ✅ Update cart item quantities
- ✅ Remove items from cart
- ✅ View cart dashboard (per customer)
- ✅ Admin: view all carts
- ✅ Auto-seeded sample products on startup
- ✅ Full error handling with meaningful HTTP status codes

---

## 🛠️ Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Backend  | Java 17, Spring Boot 3.2 |
| Database | MySQL 8.x           |
| ORM      | Spring Data JPA / Hibernate |
| Build    | Maven               |

---

## ⚙️ Setup & Run

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.x running locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/cart-management-module.git
cd cart-management-module
```

### 2. Configure Database
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cart_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Build & Run
```bash
mvn clean install
mvn spring-boot:run
```

The server starts at: **http://localhost:8080**

On first run, 8 sample products are auto-seeded into the database.

---

## 📡 API Endpoints

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart/{customerId}` | Get all cart items for a customer |
| `POST` | `/api/cart/add` | Add a product to cart |
| `PUT` | `/api/cart/update/{cartId}` | Update item quantity |
| `DELETE` | `/api/cart/remove/{cartId}` | Remove item from cart |
| `DELETE` | `/api/cart/clear/{customerId}` | Clear entire cart |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/carts` | View all customer carts |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/{id}` | Get product by ID |
| `POST` | `/api/products` | Create a new product |

---

## 📝 Sample Requests

### Add to Cart
```http
POST /api/cart/add
Content-Type: application/json

{
  "customerId": 1,
  "productId": 2,
  "quantity": 3
}
```

### Update Cart
```http
PUT /api/cart/update/1
Content-Type: application/json

{
  "quantity": 5
}
```

### Sample Response
```json
{
  "status": "success",
  "message": "Item added to cart",
  "data": {
    "cartId": 1,
    "customerId": 1,
    "productId": 2,
    "productName": "Mechanical Keyboard",
    "unitPrice": 3499.00,
    "quantity": 3,
    "totalPrice": 10497.00,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE carts (
    cart_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT         NOT NULL,
    product_id  BIGINT         NOT NULL,
    quantity    INT            NOT NULL,
    total_price DECIMAL(10,2),
    created_at  DATETIME,
    updated_at  DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
```

---

## 🧪 Running Tests
```bash
mvn test
```

---

## 🚀 Deployment (Render - Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set environment variables for DB credentials
5. Deploy!

---

## 👨‍💻 Author
Developed as part of the E-Commerce Cart Management Module Assignment.
