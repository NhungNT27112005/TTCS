# TTCS - E-commerce Web Application

This project is an e-commerce web application with separate frontend and backend components for customers and administrators.

## Project Structure

- `customer/` - Customer-facing React frontend
- `admin/admin/` - Admin panel React frontend
- `Backend/` - Main backend server
- `Backendadmin/` - Admin backend server

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Local npm Cache Fix

This repository includes `.npmrc` files in `customer/` and `admin/admin/` so npm uses a local cache folder inside each project. If you see `EPERM` errors referencing `D:\node\npm-cache`, this avoids the global cache permission issue.

## Backend Port and API Base URL

The customer backend now runs on `http://localhost:5000`. Frontend requests use `REACT_APP_API_BASE_URL` if set, otherwise they default to `http://localhost:5000`.

## Running Each Component

Each component can be run independently with a single `npm start` command that launches both frontend and backend. Note: `npm install` only needs to be run once per component after cloning the repository.

### Customer

To run the customer-facing app (frontend + backend):

```bash
cd customer
npm install  # Run this only once
npm start
```

This starts both the customer website on http://localhost:3000 and the main backend server.

### Admin

To run the admin panel app (frontend + backend):

```bash
cd admin/admin
npm install  # Run this only once
npm start
```

This starts both the admin panel (on an available port, e.g., http://localhost:3000 or 3001) and the admin backend server.