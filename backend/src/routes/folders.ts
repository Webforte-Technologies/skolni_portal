import { Router, Response } from 'express';
import { authenticateToken, requireRole, RequestWithUser } from '../middleware/auth';
import { FolderModel } from '../models/Folder';
import { GeneratedFileModel } from '../models/GeneratedFile';
import { CreateFolderRequest } from '../types/database';

const router = Router();

// Get all folders for the current user
router.get('/', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const folders = await FolderModel.findByUserId(userId, schoolId);

    return res.status(200).json({
      success: true,
      data: folders,
      message: 'Folders retrieved successfully'
    });

  } catch (error) {
    console.error('Get folders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve folders'
    });
  }
});

// Get folder hierarchy
router.get('/hierarchy', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const hierarchy = await FolderModel.getHierarchy(userId, schoolId);

    return res.status(200).json({
      success: true,
      data: hierarchy,
      message: 'Folder hierarchy retrieved successfully'
    });

  } catch (error) {
    console.error('Get folder hierarchy error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve folder hierarchy'
    });
  }
});

// Get shared folders for a school
router.get('/shared/:schoolId', authenticateToken, requireRole(['school_admin', 'teacher_school']), async (req: RequestWithUser, res: Response) => {
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

    const sharedFolders = await FolderModel.findSharedBySchool(schoolId);

    return res.status(200).json({
      success: true,
      data: sharedFolders,
      message: 'Shared folders retrieved successfully'
    });

  } catch (error) {
    console.error('Get shared folders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared folders'
    });
  }
});

// Create a new folder
router.post('/', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { name, description, parent_folder_id, is_shared } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    const folderData: CreateFolderRequest = {
      user_id: req.user.id,
      name: name.trim(),
      description: description?.trim(),
      parent_folder_id: parent_folder_id || undefined,
      is_shared: is_shared || false,
      ...(req.user.school_id && { school_id: req.user.school_id })
    };

    const folder = await FolderModel.create(folderData);

    return res.status(201).json({
      success: true,
      data: folder,
      message: 'Folder created successfully'
    });

  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create folder'
    });
  }
});

// Update a folder
router.put('/:folderId', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const folderId = req.params['folderId'];
    
    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder ID is required'
      });
    }
    
    const { name, description, parent_folder_id, is_shared } = req.body;

    // Verify folder ownership
    const existingFolder = await FolderModel.findById(folderId);
    if (!existingFolder || existingFolder.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this folder'
      });
    }

    const updateData = {
      name: name?.trim(),
      description: description?.trim(),
      parent_folder_id,
      is_shared
    };

    const updatedFolder = await FolderModel.update(folderId, updateData);

    if (!updatedFolder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedFolder,
      message: 'Folder updated successfully'
    });

  } catch (error) {
    console.error('Update folder error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update folder'
    });
  }
});

// Delete a folder
router.delete('/:folderId', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const folderId = req.params['folderId'];
    
    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder ID is required'
      });
    }

    // Verify folder ownership
    const existingFolder = await FolderModel.findById(folderId);
    if (!existingFolder || existingFolder.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this folder'
      });
    }

    const deleted = await FolderModel.delete(folderId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    
    if (error instanceof Error && error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to delete folder'
    });
  }
});

// Get materials in a folder
router.get('/:folderId/materials', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const folderId = req.params['folderId'];
    
    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder ID is required'
      });
    }

    // Verify folder access
    const folder = await FolderModel.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    // Check if user has access to this folder
    if (folder.user_id !== req.user.id && 
        (!folder.is_shared || folder.school_id !== req.user.school_id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this folder'
      });
    }

    const materials = await GeneratedFileModel.findByFolder(folderId, req.user.id);

    return res.status(200).json({
      success: true,
      data: materials,
      message: 'Folder materials retrieved successfully'
    });

  } catch (error) {
    console.error('Get folder materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve folder materials'
    });
  }
});

// Move materials to a folder
router.post('/:folderId/move-materials', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const folderId = req.params['folderId'];
    const { material_ids } = req.body;
    
    if (!Array.isArray(material_ids) || material_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Material IDs array is required'
      });
    }

    // Handle "unorganized" case - remove materials from folders
    if (folderId === 'unorganized') {
      const removed = await FolderModel.removeMaterialsFromFolder(material_ids);
      return res.status(200).json({
        success: true,
        data: removed,
        message: 'Materials removed from folder successfully'
      });
    }

    // Verify folder access for normal folder operations
    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder ID is required'
      });
    }

    const folder = await FolderModel.findById(folderId);
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    // Check if user has access to this folder
    if (folder.user_id !== req.user.id && 
        (!folder.is_shared || folder.school_id !== req.user.school_id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this folder'
      });
    }

    const moved = await FolderModel.moveMaterialsToFolder(material_ids, folderId);

    return res.status(200).json({
      success: true,
      data: moved,
      message: 'Materials moved to folder successfully'
    });

  } catch (error) {
    console.error('Move materials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to move materials to folder'
    });
  }
});

export default router;
