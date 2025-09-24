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
        console.error('Error fetching products:', error);
        res.status(500).json({
            message: 'Error fetching products',
            error: error.message
        });
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
        console.error('Error fetching product:', error);
        res.status(500).json({
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// Create new product
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received product data:', req.body);

        // Basic validation
        const requiredFields = ['name', 'price', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }

        // Check if category exists
        const categoryExists = await Category.findById(req.body.category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }

        // Check if brand exists (if provided)
        if (req.body.brand) {
            const brandExists = await Brand.findById(req.body.brand);
            if (!brandExists) {
                return res.status(400).json({ message: 'Invalid brand ID' });
            }
        }

        const product = new Product({
            ...req.body,
            createdBy: req.user._id
        });

        await product.save();
        await product.populate('category brand');

        console.log('Product created successfully:', product);
        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(400).json({
            message: 'Error creating product',
            error: error.message
        });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if product exists
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if category exists (if provided)
        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Invalid category ID' });
            }
        }

        // Check if brand exists (if provided)
        if (req.body.brand) {
            const brandExists = await Brand.findById(req.body.brand);
            if (!brandExists) {
                return res.status(400).json({ message: 'Invalid brand ID' });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category brand');

        res.json(product);
    } catch (error) {
        console.error('Product update error:', error);
        res.status(400).json({
            message: 'Error updating product',
            error: error.message
        });
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
        console.error('Product deletion error:', error);
        res.status(500).json({
            message: 'Error deleting product',
            error: error.message
        });
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
        console.error('Error fetching product stats:', error);
        res.status(500).json({
            message: 'Error fetching product statistics',
            error: error.message
        });
    }
});

module.exports = router;