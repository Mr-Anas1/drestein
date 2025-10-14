"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ onImageUpload, currentImage = null, disabled = false }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            
            // Update preview with Cloudinary URL
            setPreview(result.url);
            onImageUpload(result.url);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
            setPreview(currentImage);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        
        if (disabled) return;
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) {
            setDragActive(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const removeImage = () => {
        setPreview(null);
        onImageUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-audiowide text-muted-text mb-2">
                Event Image
            </label>
            
            {preview ? (
                <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                        <img
                            src={preview}
                            alt="Event preview"
                            className="w-full h-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                        dragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={disabled}
                    />
                    
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-background-soft rounded-full flex items-center justify-center">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            ) : (
                                <ImageIcon className="text-muted-text" size={24} />
                            )}
                        </div>
                        
                        <div>
                            <p className="text-white font-audiowide text-sm mb-2">
                                {uploading ? 'Uploading...' : 'Upload Event Image'}
                            </p>
                            <p className="text-muted-text font-space text-xs">
                                Drag and drop an image here, or click to select
                            </p>
                            <p className="text-muted-text font-space text-xs mt-1">
                                Supports: JPG, PNG, GIF (Max 10MB)
                            </p>
                        </div>
                        
                        {!uploading && (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-audiowide text-sm hover:bg-hover-primary transition-colors duration-300"
                            >
                                <Upload size={16} />
                                Choose File
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            <p className="text-muted-text font-space text-xs">
                💡 Images will be automatically optimized and resized for best performance
            </p>
        </div>
    );
};

export default ImageUpload;
