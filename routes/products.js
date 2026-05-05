const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Product, Seller } = require('../models');

const JWT_SECRET = 'your-secret-key-change-this-in-production';

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

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get all products (approved sellers only)
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{
                model: Seller,
                as: 'seller',
                where: { status: 'approved' },
                attributes: ['id', 'businessName', 'name']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{
                model: Seller,
                as: 'seller',
                attributes: ['id', 'businessName', 'name', 'phone']
            }]
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Get products by seller (for seller dashboard)
router.get('/seller/my-products', verifySellerToken, async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { sellerId: req.sellerId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Create new product (with image upload) - Seller only
router.post('/', verifySellerToken, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, brand, stock, category } = req.body;

        // Validate input
        if (!name || !description || !price || !brand) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        // Get image path if uploaded
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        // Create product with sellerId from token
        const product = await Product.create({
            sellerId: req.sellerId,
            name,
            description,
            price,
            brand,
            category: category || 'general',
            image: imagePath,
            stock: stock || 0
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Update product - Seller can only update their own products
router.put('/:id', verifySellerToken, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, brand, stock } = req.body;
        const product = await Product.findOne({
            where: { 
                id: req.params.id,
                sellerId: req.sellerId
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to update it' });
        }

        // Update fields
        const updateData = {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            brand: brand || product.brand,
            stock: stock !== undefined ? stock : product.stock
        };

        // Update image if new one uploaded
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        await product.update(updateData);

        res.status(200).json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product - Seller can only delete their own products
router.delete('/:id', verifySellerToken, async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { 
                id: req.params.id,
                sellerId: req.sellerId
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to delete it' });
        }

        await product.destroy();

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

module.exports = router;
