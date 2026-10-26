# 🍽️ Food Corner – Online Food Ordering System

Food Corner is a full-stack web application developed to make online food ordering simple and convenient. Customers can browse available food items, add them to their cart, place orders, and check their order status. Administrators can manage food items and update customer orders.

## 📌 Features

### Customer
- Create an account and log in securely.
- Browse and search available food items.
- Add food items to the cart and update quantities.
- Place orders with delivery details.
- Choose Cash on Delivery.
- View previous orders and their status.

### Admin
- Log in through the admin login page.
- Add, edit, and delete food items.
- Update food availability.
- View customer orders.
- Update order status from Pending to Accepted, Preparing, Ready, and Delivered.

## 🛠️ Technology Stack

| Part | Technologies |
|---|---|
| Frontend | React.js, Vite, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | Express Session, bcryptjs |
| Session Storage | MongoDB using connect-mongo |
| Navigation | React Router |
| Templates | EJS for the order confirmation page |

## 📂 Project Structure

```text
Food-Ordering-System/
├── food-ordering-system/
│   ├── frontend/
│   │   ├── src/
│   │   ├── index.html
│   │   └── package.json
│   ├── backend/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── scripts/
│   │   ├── views/
│   │   ├── server.js
│   │   └── package.json
│   ├── .gitignore
│   └── README.md
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm (installed with Node.js)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

## 🚀 How to Run the Project Locally

### Step 1: Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/MedapatiNavyasri/Food-Ordering-System.git
cd Food-Ordering-System/food-ordering-system
```

### Step 2: Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Step 3: Configure MongoDB and environment variables

Inside the `backend` folder, create a `.env` file. Add the following configuration and replace the placeholder values with your own settings.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/food-corner
PORT=5000
SESSION_SECRET=replace_with_a_long_random_secret
COOKIE_SECURE=false
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword123
```

**Important:**
- For local MongoDB, make sure the MongoDB service is running.
- If you use MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.
- Use a strong, private `SESSION_SECRET`.
- Change the example admin password to a strong password of your own.
- Keep `.env` private. Do not commit database credentials or secrets to GitHub.

### Step 4: Add sample food items and create the admin account

Open a terminal in the `backend` directory:

```bash
npm run seed
npm run create-admin
```

These commands add sample food items and create the administrator account using the values in your `.env` file.

### Step 5: Start the backend

In the first terminal:

```bash
cd backend
npm run dev
```

The backend runs at:

`http://localhost:5000`

Wait until the server confirms that MongoDB is connected.

### Step 6: Start the frontend

Open a **second terminal** in VS Code:

```bash
cd Food-Ordering-System/food-ordering-system/frontend
npm run dev
```

Open the local URL shown in your terminal. Normally, it is:

**http://localhost:5173**

Keep both terminals running while using the application.

## 🧪 Testing the Application

1. Open the frontend in your browser.
2. Register a new customer account and log in.
3. Browse the menu and add items to your cart.
4. Proceed to checkout and enter delivery details.
5. Place an order using Cash on Delivery.
6. Log in through the admin login page using the admin credentials configured in `.env`.
7. Add or update food items and manage customer orders.
8. Log in as the customer again to check the order status.

## 🌐 Live Demo

- **Frontend:** [Food Ordering System](https://food-ordering-system-4oly.vercel.app/)
- **Backend:** [Backend Service](https://food-ordering-system-t03m.onrender.com/)

The live application depends on the deployed frontend, backend, database connection, and their environment configurations being available.

## 🔒 Security

- Passwords are hashed before storage.
- Login sessions are stored in MongoDB.
- Customer and administrator access is handled through authentication and role checks.
- Customers can access only their own orders.
- Order totals are calculated on the backend.

## 📚 Learning Outcomes

This project provides practical experience with:

- Building a React frontend using Vite.
- Creating REST APIs with Node.js and Express.js.
- Connecting an application to MongoDB.
- Implementing registration, login, and session management.
- Performing CRUD operations.
- Managing shopping carts and customer orders.
- Deploying a full-stack application.

---

*This project was developed for learning and demonstrating full-stack web development concepts.*
