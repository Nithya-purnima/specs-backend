const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Customer, Product, Seller, Admin } = require('../models');

const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        req.adminId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Get all customers
router.get('/customers', verifyAdminToken, async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: ['id', 'name', 'email', 'phone', 'address', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ customers, count: customers.length });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
});

// Get all products
router.get('/products', verifyAdminToken, async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{
                model: Seller,
                as: 'seller',
                attributes: ['id', 'businessName', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ products, count: products.length });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get all sellers
router.get('/sellers', verifyAdminToken, async (req, res) => {
    try {
        const sellers = await Seller.findAll({
            attributes: ['id', 'name', 'email', 'phone', 'businessName', 'businessAddress', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ sellers, count: sellers.length });
    } catch (error) {
        console.error('Error fetching sellers:', error);
        res.status(500).json({ message: 'Error fetching sellers', error: error.message });
    }
});

// Get pending seller requests
router.get('/sellers/pending', verifyAdminToken, async (req, res) => {
    try {
        const pendingSellers = await Seller.findAll({
            where: { status: 'pending' },
            attributes: ['id', 'name', 'email', 'phone', 'businessName', 'businessAddress', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ sellers: pendingSellers, count: pendingSellers.length });
    } catch (error) {
        console.error('Error fetching pending sellers:', error);
        res.status(500).json({ message: 'Error fetching pending sellers', error: error.message });
    }
});

// Approve seller
router.put('/sellers/:id/approve', verifyAdminToken, async (req, res) => {
    try {
        const seller = await Seller.findByPk(req.params.id);
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        if (seller.status === 'approved') {
            return res.status(400).json({ message: 'Seller is already approved' });
        }

        await seller.update({ status: 'approved' });

        res.status(200).json({
            message: 'Seller approved successfully',
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                businessName: seller.businessName,
                status: seller.status
            }
        });
    } catch (error) {
        console.error('Error approving seller:', error);
        res.status(500).json({ message: 'Error approving seller', error: error.message });
    }
});

// Reject seller
router.put('/sellers/:id/reject', verifyAdminToken, async (req, res) => {
    try {
        const seller = await Seller.findByPk(req.params.id);
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        await seller.update({ status: 'rejected' });

        res.status(200).json({
            message: 'Seller rejected successfully',
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                businessName: seller.businessName,
                status: seller.status
            }
        });
    } catch (error) {
        console.error('Error rejecting seller:', error);
        res.status(500).json({ message: 'Error rejecting seller', error: error.message });
    }
});

// Delete product (admin can delete any product)
router.delete('/products/:id', verifyAdminToken, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Get dashboard statistics
router.get('/stats', verifyAdminToken, async (req, res) => {
    try {
        const [customersCount, productsCount, sellersCount, pendingSellersCount] = await Promise.all([
            Customer.count(),
            Product.count(),
            Seller.count(),
            Seller.count({ where: { status: 'pending' } })
        ]);

        res.status(200).json({
            stats: {
                customers: customersCount,
                products: productsCount,
                sellers: sellersCount,
                pendingSellers: pendingSellersCount
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
});

module.exports = router;
