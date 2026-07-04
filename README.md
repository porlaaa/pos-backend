# POS Backend

This is the backend API server for the Web POS demo project. It provides authentication, table management, menu/item management, and order workflows for the web and mobile clients.

## Purpose

- API server for the restaurant POS demo
- Shared backend for the React web app and Flutter mobile demo app
- Intended for portfolio and job application presentation

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
- Payment method update for orders

## API Base URL

Local development:

```text
http://localhost:5000
```

Android Emulator clients should use:

```text
http://10.0.2.2:5000
```

## Environment Variables

Create a local `.env` file in this folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pos-db
JWT_SECRET=change-this-secret
NODE_ENV=development
```

Do not commit `.env` or real secrets.

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

## API Routes

- `POST /api/user/register`
- `POST /api/user/login`
- `POST /api/user/logout`
- `GET /api/user`
- `GET /api/table`
- `POST /api/table`
- `PUT /api/table/:id`
- `DELETE /api/table/:id`
- `GET /api/menu`
- `POST /api/menu`
- `PUT /api/menu/:menuId`
- `DELETE /api/menu/:menuId`
- `GET /api/item`
- `POST /api/item`
- `PUT /api/item/:id`
- `DELETE /api/item/:id`
- `POST /api/order`
- `GET /api/order`
- `GET /api/order/:id`
- `GET /api/order/table/:tableId`
- `PUT /api/order/:id`
- `PUT /api/order/:id/add-item`
- `PATCH /api/order/:id/payment`

## Note

This repository is the API backend for the Web POS demo project. It should be deployed with real environment variables configured in the hosting provider, not committed to Git.
