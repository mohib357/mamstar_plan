const mongoose = require('mongoose');

const combinationSchema = new mongoose.Schema({
    color: String,
    colorCode: String,
    size: String,
    price: Number,
    stock: Number,
    sku: String,
    image: String
});


const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    productCode: { type: String, unique: true },
    sku: { type: String, unique: true, uppercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    price: { type: Number, required: true, min: 0 },
    previousPrice: { type: Number, min: 0 },
    basePrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    richDescription: { type: String, default: '' },
    shortDescription: String,
    bulletPoints: [String],

    color: [String],
    size: [String],
    weight: String,
    unit: String,
    dimensions: String,
    material: String,
    warranty: String,

    variants: [combinationSchema], // Multiple sizes/colors
    combinations: [combinationSchema],
    hasVariants: {
        type: Boolean,
        default: false
    },
    hasCombinations: {
        type: Boolean,
        default: false
    },

    featuredImage: String,
    mainImages: [String], // Main product images
    galleryImages: [String],
    videos: [String], // Product videos

    tags: [String],
    productTags: [String],

    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    manual: {
        type: Boolean,
        default: false
    },

    metaDescription: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate product code before saving
productSchema.pre('save', async function (next) {
    if (!this.productCode) {
        const count = await mongoose.model('Product').countDocuments();
        this.productCode = `PC${(count + 1).toString().padStart(6, '0')}`;
    }

    // Generate SKU if not provided
    if (!this.sku) {
        const count = await mongoose.model('Product').countDocuments();
        this.sku = `PROD${(count + 1).toString().padStart(5, '0')}`;
    }

    next();
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function () {
    if (!this.costPrice || !this.basePrice) return 0;
    return ((this.basePrice - this.costPrice) / this.costPrice * 100).toFixed(2);
});

// Method to check low stock
productSchema.methods.isLowStock = function () {
    // যদি ভ্যারিয়েন্ট থাকে, তাহলে সব ভ্যারিয়েন্টের স্টক চেক করুন
    if (this.hasVariants && this.variants && this.variants.length > 0) {
        return this.variants.some(variant => variant.stock <= 5); // ডিফল্ট মিনিমাম স্টক 5
    }

    // যদি কম্বিনেশন থাকে, তাহলে সব কম্বিনেশনের স্টক চেক করুন
    if (this.hasCombinations && this.combinations && this.combinations.length > 0) {
        return this.combinations.some(combination => combination.stock <= 5);
    }

    // অন্যথায়, মূল প্রোডাক্টের স্টক চেক করুন
    return this.quantity <= 5;
};

// Method to get total stock
productSchema.methods.getTotalStock = function () {
    // যদি ভ্যারিয়েন্ট থাকে, তাহলে সব ভ্যারিয়েন্টের স্টক যোগ করুন
    if (this.hasVariants && this.variants && this.variants.length > 0) {
        return this.variants.reduce((total, variant) => total + variant.stock, 0);
    }

    // যদি কম্বিনেশন থাকে, তাহলে সব কম্বিনেশনের স্টক যোগ করুন
    if (this.hasCombinations && this.combinations && this.combinations.length > 0) {
        return this.combinations.reduce((total, combination) => total + combination.stock, 0);
    }

    // অন্যথায়, মূল প্রোডাক্টের স্টক রিটার্ন করুন
    return this.quantity;
};

// Method to get minimum price
productSchema.methods.getMinimumPrice = function () {
    // যদি ভ্যারিয়েন্ট থাকে, তাহলে সব ভ্যারিয়েন্টের মধ্যে সর্বনিম্ন মূল্য খুঁজুন
    if (this.hasVariants && this.variants && this.variants.length > 0) {
        const prices = this.variants.map(variant => variant.price || this.basePrice);
        return Math.min(...prices);
    }

    // যদি কম্বিনেশন থাকে, তাহলে সব কম্বিনেশনের মধ্যে সর্বনিম্ন মূল্য খুঁজুন
    if (this.hasCombinations && this.combinations && this.combinations.length > 0) {
        const prices = this.combinations.map(combination => combination.price || this.basePrice);
        return Math.min(...prices);
    }

    // অন্যথায়, বেস প্রাইস রিটার্ন করুন
    return this.basePrice;
};

module.exports = mongoose.model('Product', productSchema);