import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        brand: '',
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 5,
        tags: '',
        attributes: {
            size: '',
            color: '',
            weight: '',
            material: ''
        }
    });
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchBrands();
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category?._id || '',
                brand: product.brand?._id || '',
                price: product.price || 0,
                costPrice: product.costPrice || 0,
                stock: product.stock || 0,
                minStock: product.minStock || 5,
                tags: product.tags?.join(', ') || '',
                attributes: product.attributes || {
                    size: '', color: '', weight: '', material: ''
                }
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
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            if (product) {
                await axios.put(`/api/products/${product._id}`, submitData);
            } else {
                await axios.post('/api/products', submitData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

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
                [name]: value
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {product ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Basic Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand._id} value={brand._id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Pricing & Inventory</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sale Price ($) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cost Price ($)</label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={formData.costPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        name="minStock"
                                        value={formData.minStock}
                                        onChange={handleChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="tag1, tag2, tag3"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Product Attributes</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Size</label>
                                <input
                                    type="text"
                                    name="attributes.size"
                                    value={formData.attributes.size}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Color</label>
                                <input
                                    type="text"
                                    name="attributes.color"
                                    value={formData.attributes.color}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight</label>
                                <input
                                    type="text"
                                    name="attributes.weight"
                                    value={formData.attributes.weight}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Material</label>
                                <input
                                    type="text"
                                    name="attributes.material"
                                    value={formData.attributes.material}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (product ? 'Update' : 'Save')} Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;