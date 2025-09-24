const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: Date,
    notes: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);