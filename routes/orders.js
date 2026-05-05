const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Order, Customer, Product, Seller } = require('../models');

const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware to verify customer token
const verifyCustomerToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.customerId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to verify seller token
const verifySellerToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'seller') {
            return res.status(403).json({ message: 'Access denied. Seller role required.' });
        }
        req.sellerId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Create new order (Customer only)
router.post('/', verifyCustomerToken, async (req, res) => {
    try {
        const { productId, quantity, deliveryAddress, phone } = req.body;

        if (!productId || !quantity || !deliveryAddress || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Get product details
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock available' });
        }

        // Calculate total price
        const totalPrice = product.price * quantity;

        // Create order
        const order = await Order.create({
            customerId: req.customerId,
            productId,
            sellerId: product.sellerId,
            quantity,
            totalPrice,
            deliveryAddress,
            phone,
            status: 'pending'
        });

        // Reduce product stock
        await product.update({
            stock: product.stock - quantity
        });

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Get customer orders
router.get('/customer/my-orders', verifyCustomerToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customerId: req.customerId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'brand', 'image', 'price']
                },
                {
                    model: Seller,
                    as: 'seller',
                    attributes: ['id', 'businessName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Get seller orders (customers who bought from this seller)
router.get('/seller/my-orders', verifySellerToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { sellerId: req.sellerId },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phone', 'address']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'brand', 'image', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Update order status (Seller only)
router.put('/:id/status', verifySellerToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOne({
            where: {
                id: req.params.id,
                sellerId: req.sellerId
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.update({ status });

        res.status(200).json({
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

module.exports = router;
