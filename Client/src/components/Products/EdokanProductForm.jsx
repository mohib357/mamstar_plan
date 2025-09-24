import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EdokanProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        productCode: '',
        category: '',
        subCategory: '',
        brand: '',
        price: '',
        previousPrice: '',
        quantity: 0,
        color: [],
        size: [],
        weight: '',
        unit: '',
        hasCombinations: false,
        combinations: [],
        featuredImage: '',
        galleryImages: [],
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
        stock: ''
    });

    // Predefined colors like EdokanBD
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
        { name: 'Gray', code: '#808080' }
    ];

    const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    useEffect(() => {
        fetchCategories();
        fetchBrands();
        if (product) {
            // Populate form with existing product data
            setFormData({
                ...product,
                productTags: product.productTags?.join(', ') || ''
            });
        }
    }, [product]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            setFormData(prev => ({
                ...prev,
                combinations: [...prev.combinations, {
                    ...newCombination,
                    sku: `${formData.productCode}-${prev.combinations.length + 1}`
                }]
            }));
            setNewCombination({ color: '', size: '', price: '', stock: '' });
        }
    };

    const removeCombination = (index) => {
        setFormData(prev => ({
            ...prev,
            combinations: prev.combinations.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                        <h1 className="text-2xl font-bold">
                            {product ? 'Edit Product' : 'Insert Product'}
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                                        placeholder="Product code will be auto-generated"
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Previous Price
                                        </label>
                                        <input
                                            type="number"
                                            name="previousPrice"
                                            value={formData.previousPrice}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
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
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <div className="flex flex-wrap gap-2">
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
                                        <div className="flex flex-wrap gap-2">
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                                            <input
                                                type="text"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                                            <input
                                                type="text"
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
                                            <div className="grid grid-cols-4 gap-2 mb-3">
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
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addCombination}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Add Combination
                                            </button>

                                            {/* Combinations List */}
                                            <div className="mt-3 space-y-2">
                                                {formData.combinations.map((combo, index) => (
                                                    <div key={index} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                                                        <span>{combo.color} - {combo.size} - ${combo.price} - Stock: {combo.stock}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCombination(index)}
                                                            className="text-red-600"
                                                        >
                                                            Remove
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gallery Images
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                // Handle multiple file uploads
                                            }}
                                            className="hidden"
                                            id="galleryImages"
                                        />
                                        <label htmlFor="galleryImages" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
                                            Choose Files
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">No files chosen</p>
                                    </div>
                                </div>
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
                                    <textarea
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-medium"
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EdokanProductForm;