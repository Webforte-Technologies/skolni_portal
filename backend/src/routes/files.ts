import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { GeneratedFileModel } from '../models/GeneratedFile';

const router = Router();

// Get all generated files for the current user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query['limit'] as string) || 50;
    const offset = parseInt(req.query['offset'] as string) || 0;
    const file_type = req.query['file_type'] as string | undefined;

    let files;
    let totalCount;

    if (file_type) {
      // Get files filtered by type
      files = await GeneratedFileModel.findByUserIdAndType(
        userId, 
        file_type, 
        limit, 
        offset
      );
      totalCount = await GeneratedFileModel.countByUserIdAndType(userId, file_type);
    } else {
      // Get all files
      files = await GeneratedFileModel.findByUserId(
        userId, 
        limit, 
        offset
      );
      totalCount = await GeneratedFileModel.countByUserId(userId);
    }

    return res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          total: totalCount,
          limit: limit,
          offset: offset,
          has_more: totalCount > offset + files.length
        }
      },
      message: 'Generated files retrieved successfully'
    });

  } catch (error) {
    console.error('Get files error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve generated files'
    });
  }
});

// Get file statistics for the current user
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    
    // Get comprehensive file statistics using the existing method
    const stats = await GeneratedFileModel.getUserStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats,
      message: 'File statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get file stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve file statistics'
    });
  }
});

// Get a specific file by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }
    const userId = req.user.id;

    const file = await GeneratedFileModel.findById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Ensure the file belongs to the current user
    if (file.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: file,
      message: 'File retrieved successfully'
    });

  } catch (error) {
    console.error('Get file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve file'
    });
  }
});

// Delete a file by ID
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }
    const userId = req.user.id;

    const file = await GeneratedFileModel.findById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Ensure the file belongs to the current user
    if (file.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await GeneratedFileModel.delete(id);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

export default router;
