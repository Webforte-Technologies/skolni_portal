import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, RequestWithUser } from '../middleware/auth';
import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Image upload endpoint
router.post('/image', authenticateToken, upload.single('image'), async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Return the file information
    return res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// OCR processing endpoint
router.post('/ocr/process', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        error: 'Image path is required'
      });
    }

    // Validate that the file exists and is accessible
    const fullPath = path.join(__dirname, '../../uploads', path.basename(imagePath));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        error: 'Image file not found'
      });
    }

    // Process OCR using Tesseract.js
    const worker = await createWorker('eng+ces'); // English + Czech
    
    try {
      const { data: { text } } = await worker.recognize(fullPath);
      await worker.terminate();

      // Clean up the uploaded file
      fs.unlinkSync(fullPath);

      return res.status(200).json({
        success: true,
        data: {
          text: text.trim(),
          confidence: 0.8 // Placeholder confidence score
        },
        message: 'OCR processing completed successfully'
      });

    } catch (ocrError) {
      await worker.terminate();
      throw ocrError;
    }

  } catch (error) {
    console.error('OCR processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process OCR'
    });
  }
});

// Error handling middleware for multer
router.use((error: any, _req: Request, res: Response, _next: unknown) => {
  void _next;
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'File upload failed'
  });
});

export default router;
