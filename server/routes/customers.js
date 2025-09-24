const express = require('express');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;