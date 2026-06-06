# 💝 Wishlist Management Module

A **Spring Boot + MySQL** REST API for managing customer wishlists in an e-commerce application.

---

## 📋 Features

- ✅ Add products to wishlist (with duplicate check)
- ✅ View wishlist with product name, price & availability status
- ✅ Remove items from wishlist
- ✅ Move wishlist item directly to cart (with stock validation)
- ✅ Clear entire wishlist
- ✅ Check if a product is already wishlisted
- ✅ Auto-seeded sample products on startup

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2 |
| Database | MySQL 8.x |
| ORM | Spring Data JPA / Hibernate |
| Build | Maven |

---

## ⚙️ Setup & Run

### Prerequisites
- Java 17+, Maven 3.8+, MySQL 8.x

### 1. Clone & Configure
```bash
git clone https://github.com/YOUR_USERNAME/wishlist-management-module.git
cd wishlist-management-module
```
Edit `src/main/resources/application.properties` with your MySQL credentials.

### 2. Build & Run
```bash
mvn clean install
mvn spring-boot:run
```
Server starts at **http://localhost:8080**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/wishlist/{customerId}` | View customer's wishlist |
| `POST` | `/api/wishlist/add` | Add product to wishlist |
| `DELETE` | `/api/wishlist/remove/{wishlistId}` | Remove item from wishlist |
| `POST` | `/api/wishlist/move-to-cart/{wishlistId}` | Move item to cart |
| `DELETE` | `/api/wishlist/clear/{customerId}` | Clear entire wishlist |
| `GET` | `/api/wishlist/check/{customerId}/{productId}` | Check if in wishlist |

---

## 🧪 Tests
```bash
mvn test
```
