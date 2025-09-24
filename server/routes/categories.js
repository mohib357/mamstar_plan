const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;