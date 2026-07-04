# POS Backend

This is the backend API server for the Web POS demo project. It handles authentication, restaurant tables, menus, items, orders, and payment status updates for both the web and mobile clients.

## What It Is

The backend is the central API layer of the POS system. The React web app and Flutter mobile demo both communicate with this server to read and update restaurant data.

## How It Works

1. A user logs in from the web or mobile client.
2. The server verifies the user and returns an authenticated session.
3. Protected API routes use that session to control access.
4. The server manages tables, menus, items, and orders.
5. Order updates are saved in MongoDB and reflected in connected clients.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Cookie-based auth
- bcrypt

## Main Features

- Employee registration and login
- Authenticated user session
- Table management
- Menu category management
- Item management
- Order creation and status updates
- Payment method updates for orders

## Main API Areas

- User authentication
- Tables
- Menus
- Items
- Orders

## Run

Install dependencies:

```powershell
npm install
```

Run in development mode:

```powershell
npm run dev
```

Run in production mode:

```powershell
npm start
```

## Note

This repository is the API backend for the Web POS demo project. Sensitive configuration and deployment values should be managed locally or through the hosting provider, not documented or committed to Git.
