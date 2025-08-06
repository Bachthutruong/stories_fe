"use client";

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadPlaceholderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: Array<{ url: string; public_id: string }>;
  isUploading?: boolean;
}

const ImageUploadPlaceholder: React.FC<ImageUploadPlaceholderProps> = ({ 
  onFilesChange, 
  maxFiles = 5,
  existingImages = [],
  isUploading = false
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files.');
        return false;
      }
      
      // Check file size (10MB limit - Cloudinary free plan)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return false;
      }
      
      return true;
    });
    
    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    onFilesChange(newFiles);
  };

  const removeExistingImage = (index: number) => {
    // For existing images, we might want to mark them for deletion
    // This is a simplified version
    console.log('Remove existing image at index:', index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Existing ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeExistingImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Upload Area */}
      <div 
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
          isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isUploading ? '上傳圖片中...' : '上傳圖片'}
            </p>
            <p className="text-sm text-gray-500">
              {isUploading 
                ? '請稍候，正在處理您的圖片' 
                : '拖拽圖片到這裡，或點擊選擇檔案'
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">
              最多可上傳 {maxFiles} 張圖片，每張不超過 10MB
            </p>
          </div>
          
          {!isUploading && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              選擇檔案
            </Button>
          )}
        </div>
      </div>

      {/* Preview Selected Files */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Count */}
      {selectedFiles.length > 0 && (
        <p className="text-sm text-gray-500">
          已選擇 {selectedFiles.length} / {maxFiles} 張圖片
        </p>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在上傳圖片到伺服器...
        </div>
      )}
    </div>
  );
};

export default ImageUploadPlaceholder;
  