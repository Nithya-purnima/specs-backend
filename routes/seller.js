const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Seller } = require('../models');

const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Seller registration request
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, businessName, businessAddress } = req.body;

        // Validate input
        if (!name || !email || !password || !phone || !businessName) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        // Check if seller already exists
        const existingSeller = await Seller.findOne({ where: { email } });
        if (existingSeller) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create seller with pending status
        const seller = await Seller.create({
            name,
            email,
            password: hashedPassword,
            phone,
            businessName,
            businessAddress: businessAddress || '',
            status: 'pending'
        });

        res.status(201).json({
            message: 'Registration request submitted successfully. Please wait for admin approval.',
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                businessName: seller.businessName,
                status: seller.status
            }
        });
    } catch (error) {
        console.error('Seller registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Seller login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find seller
        const seller = await Seller.findOne({ where: { email } });
        if (!seller) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, seller.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if seller is approved
        if (seller.status !== 'approved') {
            return res.status(403).json({ 
                message: `Your account is ${seller.status}. Please wait for admin approval.`,
                status: seller.status
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: seller.id, email: seller.email, role: 'seller' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                businessName: seller.businessName,
                role: 'seller',
                status: seller.status
            }
        });
    } catch (error) {
        console.error('Seller login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// Get seller profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const seller = await Seller.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'phone', 'businessName', 'businessAddress', 'status']
        });

        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        res.status(200).json({ user: seller });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

module.exports = router;
