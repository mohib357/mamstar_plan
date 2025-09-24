const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all orders with filters
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter)
            .populate('products.product')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            createdBy: req.user._id
        });

        await order.save();
        await order.populate('products.product');

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('products.product');

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete order
router.delete('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            deliveredOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;