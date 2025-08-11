import React, { useState, useRef } from 'react';
import { X, Upload, Camera, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { api } from '../../services/apiClient';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageProcessed: (text: string, imageUrl: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageProcessed
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Prosím vyberte obrázek (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Obrázek je příliš velký. Maximální velikost je 5MB.');
      return;
    }

    setError(null);
    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedImage) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('type', 'math_problem');

      // Upload image to backend using apiClient
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (!response.data.success) {
        throw new Error('Nahrání obrázku se nezdařilo');
      }

      const result = response.data;
      setSuccess('Obrázek byl úspěšně nahrán!');
      
      // Process OCR
      setProcessing(true);
      const ocrResponse = await api.post('/upload/ocr/process', {
        imagePath: (result.data as any).path
      });

      if (!ocrResponse.data.success) {
        throw new Error('OCR zpracování se nezdařilo');
      }

      const ocrResult = ocrResponse.data;
      
      // Call the callback with processed text and image URL
      onImageProcessed((ocrResult.data as any).text, (result.data as any).path);
      
      // Close modal after successful processing
      setTimeout(() => {
        onClose();
        resetState();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Došlo k chybě při zpracování obrázku');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const resetState = () => {
    setDragActive(false);
    setUploading(false);
    setProcessing(false);
    setImagePreview(null);
    setUploadedImage(null);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Nahrát obrázek matematického problému
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Upload Area */}
          <div
            ref={dropRef}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-32 object-contain mx-auto rounded border"
                />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Obrázek připraven k nahrání
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-neutral-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Přetáhněte obrázek sem nebo klikněte pro výběr
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Podporované formáty: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Vybrat obrázek
                </Button>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Camera capture option */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement camera capture
                alert('Funkce kamery bude implementována v další verzi');
              }}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Pořídit fotku kamerou
            </Button>
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400">{success}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={uploading || processing}
            >
              Zrušit
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1"
              disabled={!uploadedImage || uploading || processing}
            >
              {uploading || processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Nahrávání...' : 'Zpracování...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Nahrát a zpracovat
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            <p>Obrázek bude analyzován pomocí OCR technologie</p>
            <p>a text bude vložen do chatu pro další zpracování AI asistentem.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
