import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'react-query';
import { 
  FileText, Folder, FolderOpen, Eye, Trash2, Share2, Download, 
  Move, Plus, MoreVertical,
  BookOpen, Target, Sparkles, Presentation, Users, Tag, Bookmark
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import apiClient from '../../services/apiClient';
import { exportStructuredToDocx } from '../../utils/exportUtils';

interface Material {
  id: string;
  title: string;
  file_type: string;
  created_at: string;
  folder_id?: string;
  content: any;
  ai_tags?: string[];
  ai_subject?: string;
  ai_difficulty?: string;
  ai_category?: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  is_shared: boolean;
  material_count: number;
}

interface DragDropMaterialsGridProps {
  materials: Material[];
  folders: Folder[];
  viewMode: 'grid' | 'list';
  onMaterialSelect: (material: Material) => void;
  onFolderSelect: (folder: Folder) => void;
  onRefresh: () => void;
}

interface DragState {
  isDragging: boolean;
  draggedItem: Material | null;
  dragOverFolder: string | null;
  dragStartPosition: { x: number; y: number } | null;
}

const DragDropMaterialsGrid: React.FC<DragDropMaterialsGridProps> = ({
  materials,
  folders,
  viewMode,
  onMaterialSelect,
  onFolderSelect,
  onRefresh
}) => {
  const { showToast } = useToast();
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOverFolder: null,
    dragStartPosition: null
  });
  
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [showContextMenu, setShowContextMenu] = useState<{
    x: number;
    y: number;
    materialId: string;
  } | null>(null);
  
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Move material to folder mutation
  const moveToFolderMutation = useMutation(
    async (data: { materialIds: string[]; folderId: string | null }) => {
      if (data.folderId) {
        return await apiClient.post(`/folders/${data.folderId}/move-materials`, {
          material_ids: data.materialIds
        });
      } else {
        // Move to root (no folder)
        return await apiClient.post('/files/move-to-root', {
          material_ids: data.materialIds
        });
      }
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Materiály byly úspěšně přesunuty' });
        onRefresh();
        setSelectedMaterials([]);
      },
      onError: (error: any) => {
        showToast({ 
          type: 'error', 
          message: error.response?.data?.error || 'Chyba při přesouvání materiálů' 
        });
      }
    }
  );

  // Delete material mutation
  const deleteMaterialMutation = useMutation(
    async (materialId: string) => {
      await apiClient.delete(`/files/${materialId}`);
    },
    {
      onSuccess: (_, variables) => {
        showToast({ type: 'success', message: 'Materiál byl úspěšně smazán' });
        onRefresh();
        setSelectedMaterials(prev => prev.filter(id => id !== variables));
      },
      onError: () => {
        showToast({ type: 'error', message: 'Chyba při mazání materiálu' });
      }
    }
  );

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, material: Material) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', material.id);
    
    setDragState({
      isDragging: true,
      draggedItem: material,
      dragOverFolder: null,
      dragStartPosition: { x: e.clientX, y: e.clientY }
    });

    // Create custom drag preview
    if (dragPreviewRef.current) {
      const preview = dragPreviewRef.current;
      preview.style.display = 'block';
      preview.textContent = material.title;
      e.dataTransfer.setDragImage(preview, 50, 25);
      
      setTimeout(() => {
        preview.style.display = 'none';
      }, 0);
    }
  }, []);

  // Handle drag over folder
  const handleDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverFolder: folderId
    }));
  }, []);

  // Handle drag leave folder
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drag over if we're actually leaving the folder area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dragOverFolder: null
      }));
    }
  }, []);

  // Handle drop on folder
  const handleDrop = useCallback((e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    
    const materialId = e.dataTransfer.getData('text/plain');
    if (materialId && dragState.draggedItem) {
      const materialIds = selectedMaterials.length > 0 && selectedMaterials.includes(materialId)
        ? selectedMaterials
        : [materialId];
      
      moveToFolderMutation.mutate({
        materialIds,
        folderId
      });
    }
    
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverFolder: null,
      dragStartPosition: null
    });
  }, [dragState.draggedItem, selectedMaterials, moveToFolderMutation]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOverFolder: null,
      dragStartPosition: null
    });
  }, []);

  // Handle material selection
  const handleMaterialSelection = useCallback((materialId: string, isSelected: boolean) => {
    setSelectedMaterials(prev => 
      isSelected 
        ? [...prev, materialId]
        : prev.filter(id => id !== materialId)
    );
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, materialId: string) => {
    e.preventDefault();
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      materialId
    });
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(null);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);

  // Get file icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'worksheet': return <FileText className="w-5 h-5" />;
      case 'lesson_plan': return <BookOpen className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'project': return <Sparkles className="w-5 h-5" />;
      case 'presentation': return <Presentation className="w-5 h-5" />;
      case 'activity': return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400';
    }
  };

  // Render folder drop zone
  const renderFolderDropZone = (folder: Folder | null) => {
    const isDropZone = folder?.id === dragState.dragOverFolder || (folder === null && dragState.dragOverFolder === 'root');
    const folderName = folder?.name || 'Kořenová složka';
    const folderId = folder?.id || null;

    return (
      <div
        key={folder?.id || 'root'}
        className={`
          p-4 border-2 border-dashed rounded-lg transition-all cursor-pointer
          ${isDropZone 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
          }
          ${dragState.isDragging ? 'opacity-100' : 'opacity-60'}
        `}
        onDragOver={(e) => handleDragOver(e, folder?.id || 'root')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, folderId)}
        onClick={() => folder && onFolderSelect(folder)}
      >
        <div className="flex items-center gap-3">
          {isDropZone ? (
            <FolderOpen className="w-6 h-6 text-blue-500" />
          ) : (
            <Folder className="w-6 h-6 text-neutral-500" />
          )}
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {folderName}
            </div>
            {folder && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {folder.material_count} materiálů
                {folder.description && ` • ${folder.description}`}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render material card
  const renderMaterialCard = (material: Material) => {
    const isSelected = selectedMaterials.includes(material.id);
    const isDragged = dragState.draggedItem?.id === material.id;

    return (
      <Card
        key={material.id}
        className={`
          transition-all cursor-move hover:shadow-lg
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          ${isDragged ? 'opacity-50 transform rotate-2' : ''}
        `}
        draggable
        onDragStart={(e) => handleDragStart(e, material)}
        onDragEnd={handleDragEnd}
        onContextMenu={(e) => handleContextMenu(e, material.id)}
      >
        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleMaterialSelection(material.id, e.target.checked)}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              {getFileIcon(material.file_type)}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {material.ai_category || 'Nezařazené'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Bookmark icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Bookmark functionality
                  showToast({ type: 'info', message: 'Funkce záložek bude brzy dostupná' });
                }}
                className="p-1 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-blue-500 hover:text-blue-600 transition-colors"
                title="Přidat do záložek"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              
              {/* Tags indicator */}
              {material.ai_tags && material.ai_tags.length > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <Tag className="w-3 h-3 text-neutral-500" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {material.ai_tags.length}
                  </span>
                </div>
              )}
              
              {/* Context menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, material.id);
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                title="Další možnosti"
              >
                <MoreVertical className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>
          
          <h4 
            className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 cursor-pointer"
            onClick={() => onMaterialSelect(material)}
          >
            {material.title}
          </h4>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {material.ai_subject && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                {material.ai_subject}
              </span>
            )}
            {material.ai_difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.ai_difficulty)}`}>
                {material.ai_difficulty}
              </span>
            )}
          </div>
          
          {material.ai_tags && material.ai_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {material.ai_tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                  {tag}
                </span>
              ))}
              {material.ai_tags.length > 3 && (
                <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                  +{material.ai_tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
            {new Date(material.created_at).toLocaleDateString('cs-CZ')}
          </div>
          
          {/* Action buttons - compact layout */}
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMaterialSelect(material);
              }}
              className="px-2 py-1.5 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Otevřít
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const content = typeof material.content === 'string' 
                    ? JSON.parse(material.content) 
                    : material.content;
                  await exportStructuredToDocx(content, material.title);
                  showToast({ type: 'success', message: 'Materiál byl exportován' });
                } catch (error) {
                  showToast({ type: 'error', message: 'Chyba při exportu materiálu' });
                }
              }}
              title="Stáhnout"
              className="px-2 py-1.5 text-xs"
            >
              <Download className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Move functionality - show folder selection
                showToast({ type: 'info', message: 'Přetáhněte materiál do složky pro přesun' });
              }}
              title="Přesunout"
              className="px-2 py-1.5 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <Folder className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Share functionality
                showToast({ type: 'info', message: 'Funkce sdílení bude brzy dostupná' });
              }}
              title="Sdílet"
              className="px-2 py-1.5 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <Share2 className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Opravdu chcete smazat tento materiál?')) {
                  deleteMaterialMutation.mutate(material.id);
                }
              }}
              title="Smazat"
              className="px-2 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Drag preview element */}
      <div
        ref={dragPreviewRef}
        className="fixed top-0 left-0 bg-blue-500 text-white px-3 py-1 rounded shadow-lg text-sm font-medium pointer-events-none z-50"
        style={{ display: 'none' }}
      />

      {/* Selection toolbar */}
      {selectedMaterials.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Vybráno {selectedMaterials.length} materiálů
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMaterials([])}
              >
                Zrušit výběr
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Bulk move functionality
                  showToast({ type: 'info', message: 'Přetáhněte materiály do složky pro přesun' });
                }}
              >
                <Move className="w-4 h-4 mr-2" />
                Přesunout
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedMaterials.forEach(id => {
                    deleteMaterialMutation.mutate(id);
                  });
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Smazat
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Drop zones (folders) */}
      {dragState.isDragging && (
        <Card>
          <div className="p-4">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
              Přetáhněte materiál do složky:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderFolderDropZone(null)}
              {folders.map(folder => renderFolderDropZone(folder))}
            </div>
          </div>
        </Card>
      )}

      {/* Materials grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {materials.map(material => renderMaterialCard(material))}
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
          style={{
            left: showContextMenu.x,
            top: showContextMenu.y
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            onClick={() => {
              const material = materials.find(m => m.id === showContextMenu.materialId);
              if (material) onMaterialSelect(material);
              setShowContextMenu(null);
            }}
          >
            <Eye className="w-4 h-4" />
            Otevřít
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            onClick={() => {
              handleMaterialSelection(
                showContextMenu.materialId, 
                !selectedMaterials.includes(showContextMenu.materialId)
              );
              setShowContextMenu(null);
            }}
          >
            <Move className="w-4 h-4" />
            {selectedMaterials.includes(showContextMenu.materialId) ? 'Zrušit výběr' : 'Vybrat'}
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            onClick={async () => {
              const material = materials.find(m => m.id === showContextMenu.materialId);
              if (material) {
                try {
                  const content = typeof material.content === 'string' 
                    ? JSON.parse(material.content) 
                    : material.content;
                  await exportStructuredToDocx(content, material.title);
                  showToast({ type: 'success', message: 'Materiál byl exportován' });
                } catch (error) {
                  showToast({ type: 'error', message: 'Chyba při exportu materiálu' });
                }
              }
              setShowContextMenu(null);
            }}
          >
            <Download className="w-4 h-4" />
            Stáhnout
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            onClick={() => {
              // Share functionality
              setShowContextMenu(null);
            }}
          >
            <Share2 className="w-4 h-4" />
            Sdílet
          </button>
          
          <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex items-center gap-2"
            onClick={() => {
              deleteMaterialMutation.mutate(showContextMenu.materialId);
              setShowContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Smazat
          </button>
        </div>
      )}

      {/* Empty state */}
      {materials.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Žádné materiály
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Začněte vytvářet své první vzdělávací materiály.
          </p>
          <Button onClick={() => window.location.href = '/materials/create'}>
            <Plus className="w-4 h-4 mr-2" />
            Vytvořit materiál
          </Button>
        </Card>
      )}
    </div>
  );
};

export default DragDropMaterialsGrid;