# Food Corner - Online Food Ordering System

A college-level full-stack project.

- **Frontend:** React (Vite), plain CSS, `react-router-dom` for page navigation
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB (sessions are also stored in MongoDB)
- **Server-side template:** EJS (only the order confirmation page)

Extra npm packages (kept to the minimum): `bcryptjs` (password hashing), `express-session` + `connect-mongo` (login sessions), `dotenv` (.env file), `react-router-dom` (routes in React).
`bcryptjs` is the pure-JavaScript version of bcrypt. It works the same way but needs no C++ build tools on Windows.

## Project structure

```
food-ordering-system/
  frontend/   React + Vite app (src/pages, src/components, style.css)
  backend/    Express API, models, controllers, routes, EJS view, scripts
  .gitignore
  README.md
```

---

## How to run it (Windows + VS Code)

### 1. Install the tools
1. Install **Node.js (LTS version 18 or newer)** from https://nodejs.org. Check in a terminal: `node -v` and `npm -v`.
2. Install **VS Code** from https://code.visualstudio.com.
3. Set up **MongoDB** (choose A or B below).

### 2. Open the project
Open VS Code -> File -> Open Folder -> choose `food-ordering-system`. Open a terminal with Ctrl + ` (backtick). You will use two terminals (use the `+` button for a second one).

### 3. MongoDB setup

**A) Local MongoDB**
1. Install *MongoDB Community Server* from https://www.mongodb.com/try/download/community (choose "Install as a Service").
2. The default connection string is already in `.env.example`: `mongodb://127.0.0.1:27017/food-corner`. The database is created automatically.

**B) MongoDB Atlas (cloud, free tier)**
1. Create an account at https://www.mongodb.com/atlas and create a free cluster.
2. Database Access -> add a database user (username + password).
3. Network Access -> "Add IP Address" -> add your current IP (or `0.0.0.0/0` for a college demo only).
4. Click Connect -> Drivers -> copy the connection string and put your password and a database name in it, for example:
   `mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/food-corner?retryWrites=true&w=majority`

### 4. Install dependencies (Terminal 1)
```
cd backend
npm install
cd ../frontend
npm install
```

### 5. Create `backend/.env`
A `backend/.env` file with placeholders is included. Open it and change:

| Variable | Meaning |
|---|---|
| `MONGODB_URI` | Your local or Atlas connection string |
| `PORT` | Backend port (default 5000) |
| `COOKIE_SECURE` | Keep `false` locally. Set `true` only when the site runs on HTTPS |
| `SESSION_SECRET` | A long random text. **The server will not start until you change it.** |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the create-admin script (password at least 8 characters) |

To make a random secret you can run:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

`.env` is listed in `.gitignore`, so it is never committed. Never put real secrets in `.env.example`.

### 6. Add sample food and the admin account
```
cd backend
npm run seed
npm run create-admin
```
- `npm run seed` adds 7 sample foods. Running it again does not create duplicates.
- `npm run create-admin` creates the admin user from the values in `.env` (password is hashed). If that email already exists, nothing is changed.

### 7. Start the backend (Terminal 1)
```
cd backend
npm run dev
```
You should see `MongoDB connected` and `Server running at http://localhost:5000`.
(`npm start` also works. `npm run dev` restarts the server when files change.)

### 8. Start the frontend (Terminal 2)
```
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser. Always use port 5173 during development.

---

## How React talks to Express

- React code calls paths like `/api/foods` (see `frontend/src/api.js`).
- In development, `frontend/vite.config.js` has a **proxy**: Vite forwards `/api/...` and `/order-confirmation/...` from port 5173 to Express on port 5000.
- Because the browser only talks to port 5173, the session cookie is on one origin and **no CORS setup is needed**.
- In production: run `npm run build` inside `frontend`. This creates `frontend/dist`. Express automatically serves that folder, so the whole site works at http://localhost:5000 with one server.

---

## Test checklist (follow these steps to demo the project)

1. Open http://localhost:5173 and register a customer (Sign Up) and then log in.
2. Open http://localhost:5173/admin/login (or the "Admin Login" link in the footer) and log in with the admin email and password from `.env`.
3. In **Manage Food**, add a new food item (name, description, category, price, image URL).
4. Log out. Log in as the customer and open **Menu**. The new food should be there.
5. Add it (and other items) to the cart. Change quantities. Click **Proceed to Checkout**.
6. Enter name, a 10-digit mobile number (for example 9876543210) and an address. Payment is Cash on Delivery. Click **Place Order**.
7. You are taken to the EJS order confirmation page.
8. Check MongoDB (Compass, Atlas "Browse Collections", or `mongosh`): the `orders` collection contains the order with item name/price snapshots.
9. Log in as admin -> **Manage Orders**. Click Accept, then Mark Preparing, Mark Ready, Mark Delivered.
10. Log in as the customer -> **My Orders**. The status shows the update (refresh the page to see it).

Other things to try: mark a food "Unavailable" while it is in a cart (cart shows a warning), change a price while it is in a cart (cart shows the price change), search/filter the menu.

---

## API endpoints

| Method | URL | Who | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | Register a customer |
| POST | /api/auth/login | public | Log in |
| POST | /api/auth/logout | public | Log out |
| GET | /api/auth/me | logged in | Current user |
| GET | /api/foods | public | Available foods |
| GET | /api/foods/:id | public | One available food |
| GET | /api/admin/foods | admin | All foods (also unavailable) |
| POST | /api/admin/foods | admin | Add food |
| PUT | /api/admin/foods/:id | admin | Edit food |
| DELETE | /api/admin/foods/:id | admin | Delete food |
| PATCH | /api/admin/foods/:id/availability | admin | Change availability |
| POST | /api/orders | logged in | Place order |
| GET | /api/orders/my | logged in | My orders |
| GET | /api/orders/:id | owner or admin | Order details |
| GET | /api/admin/orders | admin | All orders |
| PATCH | /api/admin/orders/:id/status | admin | Update status |
| GET | /order-confirmation/:id | owner or admin | EJS confirmation page |

### Order status rules (enforced in `backend/models/Order.js`)
- Pending -> Accepted, Rejected, Cancelled
- Accepted -> Preparing, Cancelled
- Preparing -> Ready, Cancelled
- Ready -> Delivered
- Delivered, Cancelled and Rejected are final.

## Security notes
- Passwords are hashed with bcrypt. Password hashes are never sent to the browser.
- Login uses `express-session` with the session stored in MongoDB. The cookie is `httpOnly` and `sameSite=lax`.
- Roles are checked on the server (`middleware/authMiddleware.js`). Public registration always creates a `customer`. Only `scripts/createAdmin.js` creates an admin.
- The server calculates all prices and totals from MongoDB. The browser only sends food ids and quantities.
- The customer id on an order comes from the session, not from the request.
- Customers can only open their own orders (API and EJS page).
- The cart in `localStorage` only holds food ids, names, prices and quantities (no sensitive data).

Not included (to keep the project simple): login rate limiting, password reset, email verification, real payments.

## Notes
- The "Popular Food" section on the home page shows the first 4 available items (there is no sales ranking in this version).
- Sample food images are Unsplash links. If a link does not load, a grey "No image" picture is shown. The admin can change image URLs at any time.
- Admin can see customer names and emails in the order details panel.

## Common problems
- **"Please set a real SESSION_SECRET"**: edit `backend/.env`.
- **MongoDB connection failed**: check `MONGODB_URI`, that MongoDB is running (local), or your IP is allowed (Atlas).
- **Login works but you are logged out on refresh**: make sure you open http://localhost:5173 (not a different host) and that `COOKIE_SECURE=false` when using http.
- **Page shows "Server error"**: the backend is not running or cannot reach MongoDB.
