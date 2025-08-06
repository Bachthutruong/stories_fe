export interface UploadedImage {
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface UploadResponse {
  success: boolean;
  image?: UploadedImage;
  images?: UploadedImage[];
  message?: string;
  error?: string;
}

class UploadService {
  private baseURL = 'https://stories-be.onrender.com/api/upload';

  private async makeRequest(endpoint: string, options: RequestInit): Promise<UploadResponse> {
    // Get token from localStorage as fallback, but this should be passed from components
    const token = localStorage.getItem('hem-story-token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  // Upload single image
  async uploadImage(file: File): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.makeRequest('/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.success || !response.image) {
      throw new Error(response.message || 'Upload failed');
    }

    return response.image;
  }

  // Upload multiple images
  async uploadImages(files: File[]): Promise<UploadedImage[]> {
    const formData = new FormData();
    files.forEach((file, _index) => {
      formData.append('images', file);
    });

    const response = await this.makeRequest('/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.success || !response.images) {
      throw new Error(response.message || 'Upload failed');
    }

    return response.images;
  }

  // Delete image
  async deleteImage(publicId: string): Promise<void> {
    await this.makeRequest(`/image/${publicId}`, {
      method: 'DELETE',
    });
  }

  // Check upload service status
  async checkStatus(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/status', {
        method: 'GET',
      });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Validate file before upload
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Only image files are allowed' };
    }

      // Check file size (10MB - Cloudinary free plan limit)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

    // Check file format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      return { isValid: false, error: 'Only JPG, PNG, GIF, and WebP formats are allowed' };
    }

    return { isValid: true };
  }

  // Validate multiple files
  validateFiles(files: File[]): { isValid: boolean; error?: string } {
    if (files.length === 0) {
      return { isValid: false, error: 'No files selected' };
    }

    if (files.length > 5) {
      return { isValid: false, error: 'Maximum 5 images allowed' };
    }

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return validation;
      }
    }

    return { isValid: true };
  }
}

export default new UploadService(); 