const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    price: { type: Number, required: true },
    costPrice: Number,
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 10 },
    images: [String],
    attributes: {
        size: String,
        color: String,
        weight: String,
        // Add more as needed
    },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    isActive: { type: Boolean, default: true },
    tags: [String]
}, { timestamps: true });

// Generate SKU before saving
productSchema.pre('save', async function (next) {
    if (!this.sku) {
        const count = await mongoose.model('Product').countDocuments();
        this.sku = `SKU${(count + 1).toString().padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);