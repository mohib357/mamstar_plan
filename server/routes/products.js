const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find().populate('category brand');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create product
router.post('/', auth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;