/**
 * Image compression utilities
 * Separated from imageOptimization.ts to avoid dynamic import conflicts
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  blur?: number;
}

/**
 * Compress image file for upload
 */
export function compressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { quality = 0.8, width, height, format = 'jpeg' } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions
      let { width: imgWidth, height: imgHeight } = img;
      
      if (width || height) {
        const aspectRatio = imgWidth / imgHeight;
        
        if (width && height) {
          imgWidth = width;
          imgHeight = height;
        } else if (width) {
          imgWidth = width;
          imgHeight = width / aspectRatio;
        } else if (height) {
          imgHeight = height;
          imgWidth = height * aspectRatio;
        }
      }
      
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, imgWidth, imgHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
