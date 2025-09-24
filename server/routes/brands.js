const express = require('express');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all brands
router.get('/', auth, async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create brand
router.post('/', auth, async (req, res) => {
    try {
        const brand = new Brand(req.body);
        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;