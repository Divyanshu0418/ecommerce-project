# E-Commerce Full Stack Project

A full-stack E-Commerce web application built using React frontend, Java Spring Boot backend, and MySQL database.

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- React Router DOM
- HTML
- CSS

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL
- Maven

## Features

### User Features
- User Registration
- User Login
- JWT Authentication
- View Products
- Product Details
- Add to Cart
- Update Cart Quantity
- Remove Product from Cart
- Checkout
- View Orders

### Admin Features
- Add Product
- Update Product
- Delete Product
- View Orders
- Update Order Status

## Project Structure

```bash
ecommerce-project/
│
├── backend/
│   ├── src/main/java/com/ecommerce/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── security/
│   │   ├── filter/
│   │   └── config/
│   │
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   ├── context/
    │   └── App.jsx
    │
    └── package.json
