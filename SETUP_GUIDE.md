# 🚀 Quick Setup Guide

## Step 1: Database Setup
Open MySQL and create the database:
```sql
CREATE DATABASE ecommerce_db;
```

## Step 2: Create Admin Account
In the `e-com-backend` folder:
```bash
npm run create-admin
```

Default admin credentials:
- Email: admin@ecommerce.com
- Password: admin123

## Step 3: Start Backend Server
```bash
cd e-com-backend
npm run dev
```
Server will run on http://localhost:5000

## Step 4: Start Frontend
Open a new terminal:
```bash
cd e-com
npm run dev
```
Frontend will run on http://localhost:5173

## 🔄 Application Workflow

### For Sellers:
1. Go to http://localhost:5173/seller-register
2. Fill the registration form with business details
3. Wait for admin approval (status: pending)
4. After admin approves, login at /seller-login
5. Upload products in seller dashboard

### For Admin:
1. Go to http://localhost:5173/admin-login
2. Login with admin credentials
3. View "Pending Sellers" tab
4. Approve or reject seller requests
5. Manage all customers, sellers, and products

### For Customers:
1. Register at /register
2. Login at /login
3. Browse products (only from approved sellers)
4. Add to cart and purchase

## 📍 Important URLs

- Customer Login: http://localhost:5173/login
- Customer Register: http://localhost:5173/register
- Seller Register: http://localhost:5173/seller-register
- Seller Login: http://localhost:5173/seller-login
- Seller Dashboard: http://localhost:5173/seller-dashboard
- Admin Login: http://localhost:5173/admin-login
- Admin Dashboard: http://localhost:5173/admin-dashboard
- Products Page: http://localhost:5173/products

## ✅ Features Checklist

✅ Customer registration and login
✅ Seller registration REQUEST (pending approval)
✅ Admin dashboard to approve/reject sellers
✅ Seller can only login AFTER admin approval
✅ Seller dashboard to upload products
✅ Products show only from approved sellers
✅ Admin can view customers, sellers, products
✅ Product details: image, price, description, brand
✅ Secure authentication with JWT
✅ Role-based access control

## 🔐 Security Note
Change the default admin password after first login!
Update JWT_SECRET in production (found in routes files).
