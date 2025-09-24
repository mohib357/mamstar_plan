const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        uppercase: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    minStock: {
        type: Number,
        default: 5
    },
    images: [{
        type: String,
        default: []
    }],
    attributes: {
        size: String,
        color: String,
        weight: String,
        dimensions: String,
        material: String
    },
    tags: [{
        type: String,
        default: []
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Generate SKU before saving
productSchema.pre('save', async function (next) {
    if (!this.sku) {
        const count = await mongoose.model('Product').countDocuments();
        this.sku = `PROD${(count + 1).toString().padStart(5, '0')}`;
    }
    next();
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function () {
    if (!this.costPrice) return 0;
    return ((this.price - this.costPrice) / this.costPrice * 100).toFixed(2);
});

// Method to check low stock
productSchema.methods.isLowStock = function () {
    return this.stock <= this.minStock;
};

module.exports = mongoose.model('Product', productSchema);