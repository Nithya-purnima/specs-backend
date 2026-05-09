const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Product, Seller } = require('../models');
const upload = require('../middleware/upload');

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
            return res.status(403).json({
                message: 'Access denied. Seller role required.'
            });
        }

        req.sellerId = decoded.id;
        next();

    } catch (error) {
        res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

// Get all products
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

        res.status(500).json({
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Get single product
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
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({ product });

    } catch (error) {
        console.error('Error fetching product:', error);

        res.status(500).json({
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// Seller products
router.get('/seller/my-products', verifySellerToken, async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { sellerId: req.sellerId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ products });

    } catch (error) {
        console.error('Error fetching seller products:', error);

        res.status(500).json({
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Create product
router.post('/', verifySellerToken, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, brand, stock, category } = req.body;

        if (!name || !description || !price || !brand) {
            return res.status(400).json({
                message: 'All required fields must be filled'
            });
        }

        // Cloudinary image URL
        const imagePath = req.file ? req.file.path : null;

        console.log('📸 Creating product with image:', imagePath);

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

        console.log('✅ Product created successfully:', {
            id: product.id,
            name: product.name,
            imageUrl: product.image
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('❌ Error creating product:', error);

        res.status(500).json({
            message: 'Error creating product',
            error: error.message
        });
    }
});

// Update product
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
            return res.status(404).json({
                message: 'Product not found or no permission'
            });
        }

        const updateData = {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            brand: brand || product.brand,
            stock: stock !== undefined ? stock : product.stock
        };

        // Update image
        if (req.file) {
            console.log('📸 Updating product image:', req.file.path);
            updateData.image = req.file.path;
        }

        await product.update(updateData);

        console.log('✅ Product updated successfully:', {
            id: product.id,
            name: product.name,
            imageUrl: product.image
        });

        res.status(200).json({
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('❌ Error updating product:', error);

        res.status(500).json({
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Delete product
router.delete('/:id', verifySellerToken, async (req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                id: req.params.id,
                sellerId: req.sellerId
            }
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found or no permission'
            });
        }

        await product.destroy();

        res.status(200).json({
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting product:', error);

        res.status(500).json({
            message: 'Error deleting product',
            error: error.message
        });
    }
});

module.exports = router;