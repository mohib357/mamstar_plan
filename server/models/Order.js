const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true },
    customer: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        total: Number
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: String,
    orderDate: { type: Date, default: Date.now },
    deliveryDate: Date,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `ORD${(count + 1).toString().padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);