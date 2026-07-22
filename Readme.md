# 📚 Full-Stack E-Commerce Bookstore

A robust, database-driven web application for browsing, purchasing, and managing book orders. Built with Node.js, Express, and PostgreSQL, this project demonstrates end-to-end web development, RESTful API design, and relational database management.

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Security and Best Practices](#security-and-best-practices)
- [Future Improvements](#future-improvements)

---

## Overview

This project is a fully functional e-commerce platform tailored for a bookstore. It handles the complete user journey: from account registration and product browsing to shopping cart management, checkout, and order tracking. The application uses a server-side rendered architecture with EJS, ensuring fast initial page loads and seamless database interactions.

---

## Tech Stack

| Category | Technologies Used |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (with pg client) |
| **Templating** | EJS (Embedded JavaScript) |
| **Environment** | Dotenv (for secure configuration management) |
| **Middleware** | Body-Parser (URL-encoded and JSON parsing) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (served via Express static) |

---

## Key Features

- ✅ **User Authentication**: Secure registration and login flows with session state management.
- ✅ **Product Catalog**: Dynamic rendering of book listings with cover images, titles, and prices.
- ✅ **Shopping Cart**: Real-time cart updates (add, remove, adjust quantities) with persistent database storage.
- ✅ **Order Processing**: Transactional checkout flow that generates orders, records order items, and clears the cart.
- ✅ **User Dashboard**: Profile management, address updates, and comprehensive order history with detailed receipts.
- ✅ **Contact System**: Integrated contact form that securely logs user inquiries into the database.

---

## Database Schema

The application relies on a normalized PostgreSQL database with the following core tables:

1. **customers**: Stores user credentials, full names, and shipping addresses.
2. **books**: Contains product inventory (title, author, price, cover image URL).
3. **cart**: Junction table linking customers and books with a quantity field.
4. **orders**: Records high-level order data (customer ID, total amount, status).
5. **order_items**: Detailed breakdown of each order (order ID, book ID, quantity, price at time of purchase).
6. **contactUs**: Logs customer support inquiries.

---

## Getting Started

Follow these steps to run the project locally:

**Step 1: Clone the Repository**
`git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git`
`cd YOUR-REPO`

**Step 2: Install Dependencies**
`npm install`

**Step 3: Configure Environment Variables**
Create a `.env` file in the root directory and add your PostgreSQL credentials:
`PORT=3000`
`DbUser=your_db_user`
`DbHost=localhost`
`DbName=your_database_name`
`DbPassword=your_db_password`
`DbPort=5432`

**Step 4: Initialize the Database**
Ensure your PostgreSQL database is running and the tables (customers, books, cart, orders, order_items, contactUs) are created. You can use a schema script or a tool like pgAdmin.

**Step 5: Start the Server**
`npm start`

Visit `http://localhost:3000` in your browser.

---

## Security and Best Practices

- **Environment Variables**: Sensitive database credentials are strictly managed via `.env` and never hardcoded.
- **Parameterized Queries**: All database interactions use parameterized queries (`$1`, `$2`) to prevent SQL Injection attacks.
- **Access Control**: Routes like `/cart`, `/profile`, and `/orderdetails` are protected by middleware checks to ensure only authenticated users can access them.
- **Password Handling**: *(Note for production)* Passwords are currently stored for demonstration. In a production environment, this would be upgraded to use `bcrypt` for hashing and salting before database insertion.

---

## Future Improvements

- Implement JWT (JSON Web Tokens) or Express-Session for more robust, scalable authentication.
- Integrate a real payment gateway API (e.g., Stripe or PayPal) for the payment route.
- Add `bcrypt` for secure password hashing.
- Implement pagination and search/filter functionality for the book catalog.
- Add unit and integration tests using Jest or Mocha.

---

*📍 Built as a comprehensive full-stack web development project.*
