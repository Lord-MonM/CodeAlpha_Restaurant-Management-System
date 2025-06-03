# 🍽️ Restaurant Management System (Backend)

This is a purely backend RESTful API project for managing a restaurant. It allows CRUD operations for orders, inventory, tables, reservations, and menus, with proper user roles and authentication for secure access. This backend was tested using Postman.

---

## ✨ Features

- 🔐 User Authentication & Authorization using JWT

- 🧾 Orders: Place, read, update, and delete orders

- 🍽️ Menu Management: Add or modify menu items

- 📦 Inventory Tracking: Manage stock and low inventory alerts

- 🪑 Table Management: Track available/occupied tables

- 📅 Reservations: Schedule and manage reservations

- 👥 Role-Based Access: Secure endpoints based on user roles

- 📫 Fully tested using Postman

## ⚙️ Installation & Setup

1.Clone the Repository

```bash
git clone https://github.com/your-username/restaurant-management-system.git
cd restaurant-management-system
```

2.Initialize the project

install the node modules

```bash
npm init -y
```

3.Update package.json Scripts

In your package.json, add:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

4.Install Dependencies

Run this command to install required packages:

```bash
npm install bcrypt dotenv express express-async-handler express-validator jsonwebtoken moment mongoose body-parser
```

5.Run the Server

```bash
npm run dev
```

---

## 📁 Environment Configuration

Create a .env file in the root directory and add the following:

```ini
PORT=5001
CONNECTION_STRING=your_mongodb_database_url
ACCESS_TOKEN_SECRET=your_secret_key
```

🔒 **Note: .env and node_modules are excluded from the GitHub repository via .gitignore**

---

## 🧪 API Testing

All endpoints were tested using Postman. After starting the server with npm run dev, you can make requests to:

```bash
http://localhost:5001/api/...
```

## 🚧 Endpoints Overview

| Feature      | Endpoints                                           |
| ------------ | --------------------------------------------------- |
| Auth         | `/api/users/login`, `/api/users/register`           |
| Orders       | `/api/orders`                                       |
| Inventory    | `/api/inventory`, `/api/reports/inventory-usage`    |
| Menu         | `/api/menu`                                         |
| Tables       | `/api/tables`, `/api/reports/tables`                |
| Reservations | `/api/reservations`                                 |
| Reports      | `/api/reports/sales`, `/api/reports/popular-dishes` |

## 📌 Notes

- Make sure MongoDB is running or hosted (e.g., MongoDB Atlas)

- Tokens must be sent via headers for authenticated routes:

```http
Authorization: Bearer <token>
```

## 📬 Contributions

Feel free to fork, contribute, or submit issues if you’d like to improve this project!
