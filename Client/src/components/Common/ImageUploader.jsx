import React, { useState, useRef } from 'react';

const ImageUploader = ({ featuredImage, galleryImages, onFeaturedImageChange, onGalleryImagesChange }) => {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'url'
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleFileUpload = (e, isGallery = false) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (isGallery) {
                        onGalleryImagesChange([...galleryImages, e.target.result]);
                    } else {
                        onFeaturedImageChange(e.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleUrlUpload = (isGallery = false) => {
        if (imageUrl) {
            if (isGallery) {
                onGalleryImagesChange([...galleryImages, imageUrl]);
            } else {
                onFeaturedImageChange(imageUrl);
            }
            setImageUrl('');
        }
    };

    const removeImage = (index, isGallery = false) => {
        if (isGallery) {
            onGalleryImagesChange(galleryImages.filter((_, i) => i !== index));
        } else {
            onFeaturedImageChange('');
        }
    };

    return (
        <div className="space-y-4">
            {/* Featured Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Note: The image must be 2:3 Ratio</p>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'upload'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Upload from Device
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('url')}
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'url'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Add from URL
                        </button>
                    </div>

                    {/* Upload Tab Content */}
                    {activeTab === 'upload' && (
                        <div className="text-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, false)}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Choose File
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                {featuredImage ? '1 file chosen' : 'No file chosen'}
                            </p>
                        </div>
                    )}

                    {/* URL Tab Content */}
                    {activeTab === 'url' && (
                        <div className="space-y-2">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Enter image URL"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            <button
                                type="button"
                                onClick={() => handleUrlUpload(false)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Add Image from URL
                            </button>
                        </div>
                    )}

                    {/* Image Preview */}
                    {featuredImage && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                            <div className="relative inline-block">
                                <img
                                    src={featuredImage}
                                    alt="Featured preview"
                                    className="w-32 h-48 object-cover rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(0, false)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Images */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {/* Gallery Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('gallery-upload')}
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'gallery-upload'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Upload Multiple
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('gallery-url')}
                            className={`px-4 py-2 font-medium text-sm ${activeTab === 'gallery-url'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Add from URL
                        </button>
                    </div>

                    {/* Gallery Upload Tab */}
                    {activeTab === 'gallery-upload' && (
                        <div className="text-center">
                            <input
                                ref={galleryInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, true)}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Choose Files
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                {galleryImages.length} files chosen
                            </p>
                        </div>
                    )}

                    {/* Gallery URL Tab */}
                    {activeTab === 'gallery-url' && (
                        <div className="space-y-2">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Enter image URL"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            <button
                                type="button"
                                onClick={() => handleUrlUpload(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Add to Gallery
                            </button>
                        </div>
                    )}

                    {/* Gallery Preview */}
                    {galleryImages.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Gallery Preview:</p>
                            <div className="flex flex-wrap gap-2">
                                {galleryImages.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index, true)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
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
    );
};

export default ImageUploader;