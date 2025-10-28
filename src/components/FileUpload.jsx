"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

const FileUpload = ({ onFileUpload, currentFile = null, disabled = false, acceptedFormats = '.pdf,.ppt,.pptx', label = "Upload File" }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState(currentFile ? 'File uploaded' : null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (file) => {
        if (!file) {
            alert('Please select a valid file');
            return;
        }

        const validExtensions = acceptedFormats.split(',').map(ext => ext.trim().toLowerCase());
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            alert(`Please select a valid file. Accepted formats: ${acceptedFormats}`);
            return;
        }

        setFileName(file.name);
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
            onFileUpload(result.url);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file. Please try again.');
            setFileName(null);
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

    const removeFile = () => {
        setFileName(null);
        onFileUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-audiowide text-muted-text mb-2">
                {label}
            </label>
            
            {fileName ? (
                <div className="relative">
                    <div className="relative w-full p-4 rounded-lg overflow-hidden border border-border bg-background-soft flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="text-primary" size={24} />
                            <span className="text-white font-space">{fileName}</span>
                        </div>
                        {uploading && (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        )}
                    </div>
                    {!disabled && !uploading && (
                        <button
                            type="button"
                            onClick={removeFile}
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
                        accept={acceptedFormats}
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={disabled}
                    />
                    
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-background-soft rounded-full flex items-center justify-center">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            ) : (
                                <FileText className="text-muted-text" size={24} />
                            )}
                        </div>
                        
                        <div>
                            <p className="text-white font-audiowide text-sm mb-2">
                                {uploading ? 'Uploading...' : label}
                            </p>
                            <p className="text-muted-text font-space text-xs">
                                Drag and drop a file here, or click to select
                            </p>
                            <p className="text-muted-text font-space text-xs mt-1">
                                Accepted formats: {acceptedFormats}
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
                💡 Files will be securely uploaded and stored
            </p>
        </div>
    );
};

export default FileUpload;
