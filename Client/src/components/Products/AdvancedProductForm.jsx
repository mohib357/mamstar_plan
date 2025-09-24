import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from '../Common/RichTextEditor';

const AdvancedProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        richDescription: '',
        category: '',
        brand: '',
        basePrice: 0,
        costPrice: 0,
        hasVariants: false,
        variants: [],
        mainImages: [],
        videos: [],
        tags: '',
        attributes: {
            weight: '',
            dimensions: '',
            material: '',
            warranty: ''
        }
    });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newVariant, setNewVariant] = useState({
        size: '',
        color: '',
        colorCode: '#000000',
        price: '',
        stock: ''
    });

    useEffect(() => {
        fetchCategories();
        fetchBrands();
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                richDescription: product.richDescription || '',
                category: product.category?._id || '',
                brand: product.brand?._id || '',
                basePrice: product.basePrice || 0,
                costPrice: product.costPrice || 0,
                hasVariants: product.hasVariants || false,
                variants: product.variants || [],
                mainImages: product.mainImages || [],
                videos: product.videos || [],
                tags: product.tags?.join(', ') || '',
                attributes: product.attributes || {}
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
            console.log('Submitting product data:', formData);

            const submitData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                variants: formData.variants.map(variant => ({
                    ...variant,
                    price: parseFloat(variant.price) || 0,
                    stock: parseInt(variant.stock) || 0
                }))
            };

            let response;
            if (product) {
                response = await axios.put(`/api/products/${product._id}`, submitData);
            } else {
                response = await axios.post('/api/products', submitData);
            }

            console.log('Product saved successfully:', response.data);
            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('attributes.')) {
            const attrName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [attrName]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const addVariant = () => {
        if (newVariant.size && newVariant.color) {
            setFormData(prev => ({
                ...prev,
                variants: [...prev.variants, {
                    ...newVariant,
                    sku: `${formData.sku || 'VAR'}-${prev.variants.length + 1}`
                }]
            }));
            setNewVariant({ size: '', color: '', colorCode: '#000000', price: '', stock: '' });
        }
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        // Simulate image upload - in real app, upload to server
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            mainImages: [...prev.mainImages, ...imageUrls]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">
                    {product ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Basic Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief product description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rich Description</label>
                                <RichTextEditor
                                    value={formData.richDescription}
                                    onChange={(html) => setFormData(prev => ({ ...prev, richDescription: html }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand._id} value={brand._id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Media */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Pricing & Media</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($) *</label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={formData.costPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Variants Toggle */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="hasVariants"
                                    checked={formData.hasVariants}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    This product has multiple sizes/colors
                                </label>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.mainImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img src={image} alt={`Product ${index}`} className="w-16 h-16 object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    mainImages: prev.mainImages.filter((_, i) => i !== index)
                                                }))}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Video Links */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video URLs (one per line)</label>
                                <textarea
                                    value={formData.videos.join('\n')}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        videos: e.target.value.split('\n').filter(v => v.trim())
                                    }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://youtube.com/example&#10;https://vimeo.com/example"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variants Section */}
                    {formData.hasVariants && (
                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-lg text-gray-900 mb-4">Product Variants</h3>

                            {/* Add Variant Form */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Size (e.g., M, L, XL)"
                                        value={newVariant.size}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Color (e.g., Red, Blue)"
                                        value={newVariant.color}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="color"
                                        value={newVariant.colorCode}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, colorCode: e.target.value }))}
                                        className="border border-gray-300 rounded px-1 py-2 h-10"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newVariant.price}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={newVariant.stock}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, stock: e.target.value }))}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                                >
                                    + Add Variant
                                </button>
                            </div>

                            {/* Variants List */}
                            <div className="space-y-2">
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-3 border rounded">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: variant.colorCode }}
                                                title={variant.color}
                                            />
                                            <span className="font-medium">{variant.size}</span>
                                            <span>{variant.color}</span>
                                            <span>${variant.price}</span>
                                            <span>Stock: {variant.stock}</span>
                                            <span className="text-sm text-gray-500">{variant.sku}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (product ? 'Update' : 'Save')} Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvancedProductForm;