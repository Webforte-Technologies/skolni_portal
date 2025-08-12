import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { GeneratedFileModel } from '../models/GeneratedFile';

const router = Router();

// Create a new generated file/material
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { title, content, file_type = 'worksheet', ai_category, ai_subject, ai_difficulty, ai_grade_level, ai_tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    const material = await GeneratedFileModel.create({
      user_id: userId,
      title,
      content,
      file_type
    });

    // Update AI metadata if provided
    if (ai_category || ai_subject || ai_difficulty || ai_grade_level || ai_tags) {
      await GeneratedFileModel.updateAIMetadata(material.id, {
        category: ai_category,
        subject: ai_subject,
        difficulty: ai_difficulty,
        gradeLevel: ai_grade_level,
        tags: ai_tags
      });
    }

    return res.status(201).json({
      success: true,
      data: material,
      message: 'Material created successfully'
    });

  } catch (error) {
    console.error('Create material error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create material'
    });
  }
});

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

// AI-powered search with relevance scoring
router.get('/search/ai', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { 
      query, 
      category, 
      subject, 
      difficulty, 
      gradeLevel, 
      tags, 
      dateFrom, 
      dateTo 
    } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (gradeLevel) filters.gradeLevel = gradeLevel;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const results = await GeneratedFileModel.searchWithRelevance(
      userId,
      query as string,
      filters
    );

    return res.status(200).json({
      success: true,
      data: results,
      message: 'AI search completed successfully'
    });

  } catch (error) {
    console.error('AI search error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI search failed'
    });
  }
});

// Get content recommendations
router.get('/recommendations', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { limit = '10' } = req.query;

    const recommendations = await GeneratedFileModel.getRecommendations(
      userId,
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      data: recommendations,
      message: 'Content recommendations retrieved successfully'
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recommendations'
    });
  }
});

// Get content analytics
router.get('/analytics/content', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;

    const analytics = await GeneratedFileModel.getContentAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: analytics,
      message: 'Content analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get content analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve content analytics'
    });
  }
});

// Get files with AI categorization
router.get('/categorized', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { category, subject, difficulty, gradeLevel } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (gradeLevel) filters.gradeLevel = gradeLevel;

    const files = await GeneratedFileModel.findWithCategorization(
      userId,
      50,
      0
    );

    return res.status(200).json({
      success: true,
      data: files,
      message: 'Categorized files retrieved successfully'
    });

  } catch (error) {
    console.error('Get categorized files error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve categorized files'
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

// Update AI metadata for a file
router.put('/:id/ai-metadata', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const fileId = req.params['id'];
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }
    
    const userId = req.user.id;
    const metadata = req.body;

    // Verify file ownership
    const file = await GeneratedFileModel.findById(fileId);
    if (!file || file.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: 'File not found or access denied'
      });
    }

    const updatedFile = await GeneratedFileModel.updateAIMetadata(fileId, metadata);

    return res.status(200).json({
      success: true,
      data: updatedFile,
      message: 'AI metadata updated successfully'
    });

  } catch (error) {
    console.error('Update AI metadata error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update AI metadata'
    });
  }
});

export default router;
