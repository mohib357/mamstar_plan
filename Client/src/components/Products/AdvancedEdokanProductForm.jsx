import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdvancedTextEditor from '../Common/AdvancedTextEditor';
import ImageUploader from '../Common/ImageUploader';
import VideoUploader from '../Common/VideoUploader';

const AdvancedEdokanProductForm = ({ product, onSave, onCancel, compactMode = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        productCode: '',
        category: '',
        subCategory: '',
        brand: '',
        price: '',
        previousPrice: '',
        discount: '',
        quantity: 0,
        color: [],
        size: [],
        weight: '',
        unit: '',
        hasCombinations: false,
        combinations: [],
        featuredImage: '',
        galleryImages: [],
        videos: [],
        shortDescription: '',
        description: '',
        bulletPoints: [''],
        metaDescription: '',
        productTags: '',
        isFeatured: false,
        isPublished: true,
        manual: false
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newCombination, setNewCombination] = useState({
        color: '',
        size: '',
        price: '',
        stock: '',
        discount: ''
    });

    // Calculate discount percentage
    const calculateDiscount = () => {
        if (formData.previousPrice && formData.price) {
            const previous = parseFloat(formData.previousPrice);
            const current = parseFloat(formData.price);
            if (previous > current) {
                const discount = ((previous - current) / previous * 100).toFixed(1);
                return discount > 0 ? discount : 0;
            }
        }
        return 0;
    };

    // Update discount when prices change
    useEffect(() => {
        if (formData.previousPrice && formData.price) {
            const discount = calculateDiscount();
            setFormData(prev => ({ ...prev, discount: discount.toString() }));
        }
    }, [formData.previousPrice, formData.price]);

    // Update previous price when discount changes
    const handleDiscountChange = (discountValue) => {
        // Allow only numbers and decimal point
        const cleanValue = discountValue.replace(/[^0-9.]/g, '');

        if (formData.price && cleanValue) {
            const discountDecimal = parseFloat(cleanValue) / 100;
            const previousPrice = (parseFloat(formData.price) / (1 - discountDecimal)).toFixed(2);
            setFormData(prev => ({
                ...prev,
                discount: cleanValue,
                previousPrice: previousPrice
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                discount: cleanValue
            }));
        }
    };

    // Predefined colors
    const predefinedColors = [
        { name: 'Red', code: '#FF0000' },
        { name: 'Blue', code: '#0000FF' },
        { name: 'Green', code: '#00FF00' },
        { name: 'Yellow', code: '#FFFF00' },
        { name: 'Pink', code: '#FFC0CB' },
        { name: 'Orange', code: '#FFA500' },
        { name: 'Brown', code: '#A52A2A' },
        { name: 'Black', code: '#000000' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Gray', code: '#808080' },
        { name: 'Purple', code: '#800080' },
        { name: 'Gold', code: '#FFD700' },
        { name: 'Silver', code: '#C0C0C0' }
    ];

    const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40'];

    useEffect(() => {
        fetchCategories();
        fetchBrands();
        if (product) {
            setFormData({
                ...product,
                productTags: product.productTags?.join(', ') || '',
                discount: product.previousPrice && product.price ?
                    (((product.previousPrice - product.price) / product.previousPrice * 100).toFixed(1)) : '',
                videos: product.videos || []
            });
        }
    }, [product]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (formData.category) {
            fetchSubCategories(formData.category);
        } else {
            setSubCategories([]);
        }
    }, [formData.category]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axios.get(`/api/categories/${categoryId}/subcategories`);
            setSubCategories(response.data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await axios.get('/api/brands');
            setBrands(response.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.featuredImage) {
            alert('Featured image is required');
            return;
        }

        if (!formData.shortDescription || formData.shortDescription.trim() === '') {
            alert('Short description is required');
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                ...formData,
                productTags: formData.productTags.split(',').map(tag => tag.trim()).filter(tag => tag),
                bulletPoints: formData.bulletPoints.filter(point => point.trim())
            };

            let response;
            if (product) {
                response = await axios.put(`/api/products/${product._id}`, submitData);
            } else {
                response = await axios.post('/api/products', submitData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (field, value, isChecked) => {
        setFormData(prev => ({
            ...prev,
            [field]: isChecked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const addBulletPoint = () => {
        setFormData(prev => ({
            ...prev,
            bulletPoints: [...prev.bulletPoints, '']
        }));
    };

    const updateBulletPoint = (index, value) => {
        setFormData(prev => ({
            ...prev,
            bulletPoints: prev.bulletPoints.map((point, i) => i === index ? value : point)
        }));
    };

    const removeBulletPoint = (index) => {
        setFormData(prev => ({
            ...prev,
            bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
        }));
    };

    const addCombination = () => {
        if (newCombination.color && newCombination.size) {
            const combination = {
                ...newCombination,
                sku: `${formData.productCode}-${formData.combinations.length + 1}`,
                price: parseFloat(newCombination.price) || formData.price,
                stock: parseInt(newCombination.stock) || 0,
                discount: newCombination.discount || formData.discount || 0
            };

            setFormData(prev => ({
                ...prev,
                combinations: [...prev.combinations, combination]
            }));
            setNewCombination({ color: '', size: '', price: '', stock: '', discount: '' });
        }
    };

    const removeCombination = (index) => {
        setFormData(prev => ({
            ...prev,
            combinations: prev.combinations.filter((_, i) => i !== index)
        }));
    };

    // Gallery image handler - store file objects
    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            galleryImages: [...prev.galleryImages, ...files]
        }));
    };

    // Compact Mode UI
    if (compactMode) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">

                    {/* Compact Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3">
                        <div className="flex justify-between items-center">
                            <h1 className="text-xl font-bold">
                                {product ? 'Edit Product' : 'Add Product'}
                            </h1>
                            <button onClick={onCancel} className="text-white hover:text-gray-200 text-xl">×</button>
                        </div>
                    </div>

                    {/* Compact Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">

                        {/* Basic Information - Compact */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Left Column - Compact */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Code *</label>
                                    <input
                                        type="text"
                                        name="productCode"
                                        value={formData.productCode}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        >
                                            <option value="">Choose...</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                                        <select
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        >
                                            <option value="">Choose...</option>
                                            {brands.map(brand => (
                                                <option key={brand._id} value={brand._id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Compact Pricing */}
                                <div className="bg-gray-50 p-3 rounded">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Pricing</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Current Price *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                                min="0"
                                                step="0.01"
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
                                            <input
                                                type="text"
                                                value={formData.discount}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                                    const parts = value.split('.');
                                                    const cleanValue = parts.length > 2
                                                        ? parts[0] + '.' + parts.slice(1).join('')
                                                        : value;

                                                    if (cleanValue === '' || (!isNaN(cleanValue) && parseFloat(cleanValue) <= 100)) {
                                                        handleDiscountChange(cleanValue);
                                                    }
                                                }}
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    {formData.discount > 0 && (
                                        <div className="mt-1 text-xs">
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Save {formData.discount}%</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Right Column - Compact */}
                            <div className="space-y-3">
                                {/* Compact Attributes */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Colors</label>
                                    <div className="grid grid-cols-4 gap-1">
                                        {predefinedColors.slice(0, 8).map((color, index) => (
                                            <label key={index} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.color.includes(color.name)}
                                                    onChange={(e) => handleArrayChange('color', color.name, e.target.checked)}
                                                    className="w-3 h-3 text-blue-600"
                                                />
                                                <div
                                                    className="w-3 h-3 rounded border ml-1"
                                                    style={{ backgroundColor: color.code }}
                                                    title={color.name}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Sizes</label>
                                    <div className="flex flex-wrap gap-1">
                                        {predefinedSizes.slice(0, 8).map((size, index) => (
                                            <label key={index} className="flex items-center text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.size.includes(size)}
                                                    onChange={(e) => handleArrayChange('size', size, e.target.checked)}
                                                    className="w-3 h-3 text-blue-600"
                                                />
                                                <span className="ml-1">{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Compact Combinations */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        <input
                                            type="checkbox"
                                            name="hasCombinations"
                                            checked={formData.hasCombinations}
                                            onChange={handleChange}
                                            className="w-3 h-3 text-blue-600 mr-1"
                                        />
                                        Single Combinations
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Compact Media Section */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Media</h3>
                            <ImageUploader
                                featuredImage={formData.featuredImage}
                                galleryImages={formData.galleryImages}
                                onFeaturedImageChange={(image) => setFormData(prev => ({ ...prev, featuredImage: image }))}
                                onGalleryImagesChange={(images) => setFormData(prev => ({ ...prev, galleryImages: images }))}
                                compact={true}
                            />
                        </div>

                        {/* Compact Description Section */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Short Description *</label>
                                    <AdvancedTextEditor
                                        value={formData.shortDescription}
                                        onChange={(content) => setFormData(prev => ({ ...prev, shortDescription: content }))}
                                        height="80px"
                                        compact={true}
                                        className="text-editor-compact"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                    <AdvancedTextEditor
                                        value={formData.description}
                                        onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                        height="100px"
                                        compact={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Compact Submit Button */}
                        <div className="border-t pt-4 flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded text-sm font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Full Mode UI (Original Code 01)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            {product ? 'Edit Product' : 'Insert Product'}
                        </h1>
                        <button
                            onClick={onCancel}
                            className="text-white hover:text-gray-200 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Code *
                                </label>
                                <input
                                    type="text"
                                    name="productCode"
                                    value={formData.productCode}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Choose...</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sub Category
                                    </label>
                                    <select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Choose...</option>
                                        {subCategories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand
                                </label>
                                <select
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose...</option>
                                    {brands.map(brand => (
                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Pricing with Discount */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Previous Price
                                        </label>
                                        <input
                                            type="number"
                                            name="previousPrice"
                                            value={formData.previousPrice}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount %
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={formData.discount}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                                const parts = value.split('.');
                                                const cleanValue = parts.length > 2
                                                    ? parts[0] + '.' + parts.slice(1).join('')
                                                    : value;

                                                if (cleanValue === '' || (!isNaN(cleanValue) && parseFloat(cleanValue) <= 100)) {
                                                    handleDiscountChange(cleanValue);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value && !isNaN(e.target.value)) {
                                                    const formatted = parseFloat(e.target.value).toFixed(1);
                                                    handleDiscountChange(formatted);
                                                }
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        {formData.discount > 0 && (
                                            <span className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-medium">
                                                {formData.discount}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {formData.previousPrice && formData.price && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <div>Current: ${formData.price}</div>
                                        <div className="line-through">Was: ${formData.previousPrice}</div>
                                        <div className="text-green-600 font-medium">
                                            You save: ${(formData.previousPrice - formData.price).toFixed(2)} ({formData.discount}%)
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                />
                            </div>
                        </div>

                        {/* Right Column - Attributes */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Attributes
                                </label>

                                {/* Color Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {predefinedColors.map((color, index) => (
                                            <label key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.color.includes(color.name)}
                                                    onChange={(e) => handleArrayChange('color', color.name, e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <div className="flex items-center space-x-1">
                                                    <div
                                                        className="w-4 h-4 rounded border"
                                                        style={{ backgroundColor: color.code }}
                                                    />
                                                    <span className="text-sm">{color.name}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Size Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {predefinedSizes.map((size, index) => (
                                            <label key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.size.includes(size)}
                                                    onChange={(e) => handleArrayChange('size', size, e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <span className="text-sm">{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Weight and Unit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                                        <input
                                            type="text"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <input
                                            type="text"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Combinations */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <input
                                        type="checkbox"
                                        name="hasCombinations"
                                        checked={formData.hasCombinations}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded mr-2"
                                    />
                                    Single Combinations
                                </label>

                                {formData.hasCombinations && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-6 gap-2 mb-3">
                                            <select
                                                value={newCombination.color}
                                                onChange={(e) => setNewCombination(prev => ({ ...prev, color: e.target.value }))}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                            >
                                                <option value="">Color</option>
                                                {formData.color.map(color => (
                                                    <option key={color} value={color}>{color}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={newCombination.size}
                                                onChange={(e) => setNewCombination(prev => ({ ...prev, size: e.target.value }))}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                            >
                                                <option value="">Size</option>
                                                {formData.size.map(size => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={newCombination.price}
                                                onChange={(e) => setNewCombination(prev => ({ ...prev, price: e.target.value }))}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Stock"
                                                value={newCombination.stock}
                                                onChange={(e) => setNewCombination(prev => ({ ...prev, stock: e.target.value }))}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Discount %"
                                                value={newCombination.discount}
                                                onChange={(e) => setNewCombination(prev => ({ ...prev, discount: e.target.value }))}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={addCombination}
                                                className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {/* Combinations List */}
                                        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                                            {formData.combinations.map((combo, index) => (
                                                <div key={index} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded border"
                                                            style={{ backgroundColor: predefinedColors.find(c => c.name === combo.color)?.code || '#ccc' }}
                                                        />
                                                        <span>{combo.color} - {combo.size}</span>
                                                        <span>${combo.price}</span>
                                                        <span>Stock: {combo.stock}</span>
                                                        {combo.discount && (
                                                            <span className="text-red-600">Discount: {combo.discount}%</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCombination(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Featured Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Featured Image *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-2">Note: The image must be 2:3 Ratio</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setFormData(prev => ({ ...prev, featuredImage: e.target.result }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="featuredImage"
                                    />
                                    <label htmlFor="featuredImage" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
                                        Choose File
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {formData.featuredImage ? '1 file chosen' : 'No file chosen'}
                                    </p>
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gallery Images
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleGalleryImagesChange}
                                        className="hidden"
                                        id="galleryImages"
                                    />
                                    <label htmlFor="galleryImages" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
                                        Choose Files
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {formData.galleryImages.length > 0
                                            ? `${formData.galleryImages.length} file(s) chosen`
                                            : 'No files chosen'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Uploader Component */}
                        <div className="mt-6">
                            <ImageUploader
                                featuredImage={formData.featuredImage}
                                galleryImages={formData.galleryImages}
                                onFeaturedImageChange={(image) => setFormData(prev => ({ ...prev, featuredImage: image }))}
                                onGalleryImagesChange={(images) => setFormData(prev => ({ ...prev, galleryImages: images }))}
                            />
                        </div>

                        {/* Video Uploader Component */}
                        <div className="mt-6">
                            <VideoUploader
                                videos={formData.videos}
                                onVideosChange={(videos) => setFormData(prev => ({ ...prev, videos }))}
                            />
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Description *
                                </label>
                                <AdvancedTextEditor
                                    value={formData.shortDescription}
                                    onChange={(content) => setFormData(prev => ({ ...prev, shortDescription: content }))}
                                    height="42px"
                                    compact={true}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Bullet Points
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addBulletPoint}
                                        className="text-blue-600 text-sm"
                                    >
                                        + Add Bullet Point
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.bulletPoints.map((point, index) => (
                                        <div key={index} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={point}
                                                onChange={(e) => updateBulletPoint(index, e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                                placeholder={`Bullet point ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeBulletPoint(index)}
                                                className="text-red-600 px-3 py-2"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <AdvancedTextEditor
                                    value={formData.description}
                                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                    height="62px"
                                    compact={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Tags
                                </label>
                                <input
                                    type="text"
                                    name="productTags"
                                    value={formData.productTags}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type tags and separate with commas"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="border-t pt-6 flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-lg font-medium shadow-lg"
                        >
                            {loading ? 'Submitting...' : 'Submit Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvancedEdokanProductForm;