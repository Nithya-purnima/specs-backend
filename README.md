# E-commerce Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
- Make sure MySQL is installed and running
- Create a database named `ecommerce_db`
- Update database credentials in `config/database.js` if needed:
  - Default: host='localhost', user='root', password=''

### 3. Create Database
```sql
CREATE DATABASE ecommerce_db;
```

### 4. Seed Database
Run the seed script to populate initial product data:
```bash
node seedDatabase.js
```

### 5. Create Uploads Directory
The uploads folder is needed for product images:
```bash
mkdir uploads
```

### 6. Start Server
Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on: `http://localhost:5000`

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new customer
- **POST** `/api/auth/login` - Login customer
- **GET** `/api/auth/profile` - Get customer profile (requires token)

### Products
- **GET** `/api/products` - Get all products
- **GET** `/api/products/:id` - Get single product
- **POST** `/api/products` - Create new product (with image upload)
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

## Database Schema

### Customers Table
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- phone
- address
- createdAt
- updatedAt

### Products Table
- id (Primary Key)
- name
- description
- price
- brand
- image (URL)
- stock
- createdAt
- updatedAt

## Security Notes
- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- Change JWT_SECRET in production (`routes/auth.js`)
