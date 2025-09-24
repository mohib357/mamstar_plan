const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all products with filters
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            lowStock
        } = req.query;

        const filter = { isActive: true };

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) filter.category = category;

        // Brand filter
        if (brand) filter.brand = brand;

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Low stock filter
        if (lowStock === 'true') {
            filter.$expr = { $lte: ['$stock', '$minStock'] };
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(filter);

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('brand');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new product
router.post('/', auth, async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            createdBy: req.user._id
        });

        await product.save();
        await product.populate('category brand');

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category brand');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get product statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const lowStockProducts = await Product.countDocuments({
            $expr: { $lte: ['$stock', '$minStock'] },
            isActive: true
        });
        const outOfStockProducts = await Product.countDocuments({
            stock: 0,
            isActive: true
        });

        res.json({
            totalProducts,
            lowStockProducts,
            outOfStockProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;