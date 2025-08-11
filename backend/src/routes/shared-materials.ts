import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { SharedMaterialModel } from '../models/SharedMaterial';
import pool from '../database/connection';

const router = Router();

// Share a material
router.post('/share', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    console.log('🔗 Share material called by user:', req.user?.id, 'role:', req.user?.role, 'school:', req.user?.school_id);
    console.log('🔗 Share request body:', req.body);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { material_id, folder_id, is_public } = req.body;
    
    if (!material_id) {
      return res.status(400).json({
        success: false,
        error: 'Material ID is required'
      });
    }

    if (!req.user.school_id) {
      console.log('❌ User has no school_id for sharing:', req.user.id);
      return res.status(400).json({
        success: false,
        error: 'School ID is required for sharing'
      });
    }

    const shareData = {
      material_id,
      school_id: req.user.school_id,
      folder_id: folder_id || undefined,
      is_public: is_public || false
    };

    console.log('🔗 Attempting to share material with data:', shareData);

    const sharedMaterial = await SharedMaterialModel.share(shareData);

    console.log('✅ Material shared successfully:', sharedMaterial.id);

    return res.status(201).json({
      success: true,
      data: sharedMaterial,
      message: 'Material shared successfully'
    });

  } catch (error) {
    console.error('Share material error:', error);
    
    if (error instanceof Error && error.message.includes('already shared')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to share material'
    });
  }
});

// Get all shared materials in the user's school (including their own) - MUST COME FIRST!
router.get('/browse', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    console.log('🔍 Browse shared materials called by user:', req.user?.id, 'role:', req.user?.role, 'school:', req.user?.school_id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!req.user.school_id) {
      console.log('❌ User has no school_id:', req.user.id);
      return res.status(400).json({
        success: false,
        error: 'User must belong to a school to browse shared materials'
      });
    }

    const folderId = req.query['folder_id'] as string | undefined;
    const searchTerm = req.query['search'] as string | undefined;
    
    console.log('🔍 Searching for shared materials in school:', req.user.school_id, 'folder:', folderId, 'search:', searchTerm);
    
    let sharedMaterials;
    
    if (searchTerm) {
      sharedMaterials = await SharedMaterialModel.search(req.user.school_id, searchTerm, folderId);
    } else {
      sharedMaterials = await SharedMaterialModel.findBySchool(req.user.school_id, folderId);
    }

    console.log('✅ Found', sharedMaterials.length, 'shared materials');

    return res.status(200).json({
      success: true,
      data: sharedMaterials,
      message: 'Shared materials retrieved successfully'
    });

  } catch (error) {
    console.error('Browse shared materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared materials'
    });
  }
});

// Get shared materials for the current user's school
router.get('/my-school', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!req.user.school_id) {
      return res.status(400).json({
        success: false,
        error: 'User must belong to a school to view shared materials'
      });
    }

    const folderId = req.query['folder_id'] as string | undefined;
    const sharedMaterials = await SharedMaterialModel.findBySchool(req.user.school_id, folderId);

    return res.status(200).json({
      success: true,
      data: sharedMaterials,
      message: 'Shared materials retrieved successfully'
    });

  } catch (error) {
    console.error('Get shared materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared materials'
    });
  }
});

// Get shared materials for a specific school (for admins or cross-school access)
router.get('/school/:schoolId', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    const schoolId = req.params['schoolId'];
    const folderId = req.query['folder_id'] as string | undefined;
    
    // Verify user belongs to the school
    if (req.user?.school_id !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this school'
      });
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required'
      });
    }

    const sharedMaterials = await SharedMaterialModel.findBySchool(schoolId, folderId);

    return res.status(200).json({
      success: true,
      data: sharedMaterials,
      message: 'Shared materials retrieved successfully'
    });

  } catch (error) {
    console.error('Get shared materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared materials'
    });
  }
});



// DEBUG: Get all shared materials (for testing purposes)
router.get('/debug/all', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    console.log('🔍 DEBUG: Get all shared materials called by user:', req.user?.id, 'role:', req.user?.role, 'school:', req.user?.school_id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get all shared materials from the database
    const query = `
      SELECT 
        sm.*,
        gf.title,
        u.first_name,
        u.last_name,
        s.name as school_name
      FROM shared_materials sm
      JOIN generated_files gf ON sm.material_id = gf.id
      JOIN users u ON sm.shared_by_user_id = u.id
      JOIN schools s ON sm.school_id = s.id
      ORDER BY sm.shared_at DESC
    `;
    
    const result = await pool.query(query);
    console.log('🔍 DEBUG: Found', result.rows.length, 'total shared materials');

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: 'All shared materials retrieved (DEBUG)'
    });

  } catch (error) {
    console.error('DEBUG: Get all shared materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared materials'
    });
  }
});

// Get shared materials by the current user
router.get('/my-shared', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const sharedMaterials = await SharedMaterialModel.findByUser(userId, schoolId);

    return res.status(200).json({
      success: true,
      data: sharedMaterials,
      message: 'Your shared materials retrieved successfully'
    });

  } catch (error) {
    console.error('Get my shared materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared materials'
    });
  }
});

// Unshare a material
router.delete('/unshare/:materialId', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const materialId = req.params['materialId'];
    
    if (!materialId) {
      return res.status(400).json({
        success: false,
        error: 'Material ID is required'
      });
    }
    
    if (!req.user.school_id) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required'
      });
    }

    const unshared = await SharedMaterialModel.unshare(materialId, req.user.school_id);

    if (!unshared) {
      return res.status(404).json({
        success: false,
        error: 'Shared material not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Material unshared successfully'
    });

  } catch (error) {
    console.error('Unshare material error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to unshare material'
    });
  }
});

// Update sharing settings
router.put('/:materialId/settings', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const materialId = req.params['materialId'];
    const { folder_id, is_public } = req.body;
    
    if (!materialId) {
      return res.status(400).json({
        success: false,
        error: 'Material ID is required'
      });
    }
    
    if (!req.user.school_id) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required'
      });
    }

    const updatedSharing = await SharedMaterialModel.updateSharing(
      materialId, 
      req.user.school_id, 
      { folder_id, is_public }
    );

    if (!updatedSharing) {
      return res.status(404).json({
        success: false,
        error: 'Shared material not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedSharing,
      message: 'Sharing settings updated successfully'
    });

  } catch (error) {
    console.error('Update sharing settings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update sharing settings'
    });
  }
});

// Search shared materials
router.get('/search/:schoolId', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    const schoolId = req.params['schoolId'];
    const { q: searchTerm, folder_id } = req.query;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required'
      });
    }
    
    // Verify user belongs to the school
    if (req.user?.school_id !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this school'
      });
    }

    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      });
    }

    const searchResults = await SharedMaterialModel.search(
      schoolId, 
      searchTerm, 
      folder_id as string | undefined
    );

    return res.status(200).json({
      success: true,
      data: searchResults,
      message: 'Search completed successfully'
    });

  } catch (error) {
    console.error('Search shared materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search shared materials'
    });
  }
});

// Get sharing statistics for a school
router.get('/stats/:schoolId', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: Request, res: Response) => {
  try {
    const schoolId = req.params['schoolId'];
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        error: 'School ID is required'
      });
    }
    
    // Verify user belongs to the school
    if (req.user?.school_id !== schoolId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this school'
      });
    }

    const stats = await SharedMaterialModel.getSchoolStats(schoolId);

    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Sharing statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get sharing stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve sharing statistics'
    });
  }
});

export default router;
