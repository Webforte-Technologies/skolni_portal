
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FolderOpen, Plus, Edit, Trash2, Search, Filter, BookOpen, Users, Eye, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/apiClient';

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  parentName?: string;
  subject: string;
  grade: string;
  materialCount: number;
  userCount: number;
  lastActivity: Date;
  status: 'active' | 'inactive' | 'archived';
  color: string;
  icon: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<ContentCategory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
    color: '#4A90E2',
    icon: 'folder',
    tags: [] as string[]
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        search: searchQuery || undefined,
        limit: 100
      };

      const response = await api.get('/admin/content/categories', { params: filters });
      setCategories((response.data.data as ContentCategory[]) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast({ type: 'error', message: 'Chyba při načítání kategorií' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, subjectFilter, searchQuery, showToast]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/admin/content/categories/statistics/overview');
      const stats = response.data.data as any;
      // Update local state with statistics
      if (stats && stats.subjects) {
        setCategories(prev => prev.map(cat => {
          const stat = stats.subjects.find((s: any) => s.subject === cat.subject);
          return stat ? { ...cat, materialCount: stat.count } : cat;
        }));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const getStatusColor = (status: ContentCategory['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusName = (status: ContentCategory['status']) => {
    switch (status) {
      case 'active':
        return 'Aktivní';
      case 'inactive':
        return 'Neaktivní';
      case 'archived':
        return 'Archivováno';
      default:
        return 'Neznámý';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `před ${minutes} min`;
    } else if (hours < 24) {
      return `před ${hours} hod`;
    } else {
      return `před ${days} dny`;
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) return;

      const newStatus = category.status === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/content/categories/${id}`, { status: newStatus });
      
      showToast({ 
        type: 'success', 
        message: `Kategorie byla ${newStatus === 'active' ? 'aktivována' : 'deaktivována'}` 
      });
      
      await fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      showToast({ type: 'error', message: 'Chyba při změně stavu kategorie' });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Opravdu chcete smazat tuto kategorii?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(id));
    try {
      await api.delete(`/admin/content/categories/${id}`);
      showToast({ type: 'success', message: 'Kategorie byla úspěšně smazána' });
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast({ type: 'error', message: 'Chyba při mazání kategorie' });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('Název je povinný');
    if (!formData.subject.trim()) errors.push('Předmět je povinný');
    if (!formData.grade.trim()) errors.push('Ročník je povinný');
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        await api.put(`/admin/content/categories/${editingCategory.id}`, formData);
        showToast({ type: 'success', message: 'Kategorie byla úspěšně aktualizována' });
      } else {
        // Create new category
        const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await api.post('/admin/content/categories', { ...formData, slug });
        showToast({ type: 'success', message: 'Kategorie byla úspěšně vytvořena' });
      }
      
      // Refresh data and close modal
      await fetchCategories();
      setShowCreateModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', subject: '', grade: '', color: '#4A90E2', icon: 'folder', tags: [] });
      setFormErrors([]);
    } catch (error) {
      console.error('Error saving category:', error);
      showToast({ type: 'error', message: 'Chyba při ukládání kategorie' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Opravdu chcete smazat ${selectedCategories.length} vybraných kategorií?`)) {
      return;
    }

    try {
      // Delete categories one by one (could be optimized with a bulk delete endpoint)
      for (const id of selectedCategories) {
        await api.delete(`/admin/content/categories/${id}`);
      }
      
      showToast({ type: 'success', message: `${selectedCategories.length} kategorií bylo úspěšně smazáno` });
      setSelectedCategories([]);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting categories:', error);
      showToast({ type: 'error', message: 'Chyba při mazání kategorií' });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '', subject: '', grade: '', color: '#4A90E2', icon: 'folder', tags: [] });
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const openEditModal = (category: ContentCategory) => {
    setFormData({
      name: category.name,
      description: category.description,
      subject: category.subject,
      grade: category.grade,
      color: category.color,
      icon: category.icon,
      tags: category.tags
    });
    setFormErrors([]);
    setEditingCategory(category);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', subject: '', grade: '', color: '#4A90E2', icon: 'folder', tags: [] });
    setFormErrors([]);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = searchQuery === '' || 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
      const matchesSubject = subjectFilter === 'all' || category.subject === subjectFilter;

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [categories, searchQuery, statusFilter, subjectFilter]);

  const activeCount = categories.filter(cat => cat.status === 'active').length;
  const totalMaterials = categories.reduce((sum, cat) => sum + cat.materialCount, 0);
  const totalUsers = categories.reduce((sum, cat) => sum + cat.userCount, 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání kategorií...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategorie obsahu</h1>
            <p className="text-gray-600">Správa kategorií pro organizaci výukových materiálů</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {selectedCategories.length > 0 && (
              <Button
                variant="danger"
                onClick={deleteSelected}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat vybrané ({selectedCategories.length})</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Obnovit</span>
            </Button>
            <Button
              onClick={openCreateModal}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nová kategorie</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní kategorie</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem materiálů</p>
                <p className="text-2xl font-bold text-blue-600">{totalMaterials}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní uživatelé</p>
                <p className="text-2xl font-bold text-purple-600">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem kategorií</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtry:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny stavy</option>
                <option value="active">Aktivní</option>
                <option value="inactive">Neaktivní</option>
                <option value="archived">Archivované</option>
              </select>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny předměty</option>
                <option value="Matematika">Matematika</option>
                <option value="Český jazyk">Český jazyk</option>
                <option value="Anglický jazyk">Anglický jazyk</option>
                <option value="Fyzika">Fyzika</option>
                <option value="Dějepis">Dějepis</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat kategorie..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Categories Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories(filteredCategories.map(cat => cat.id));
                        } else {
                          setSelectedCategories([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Předmět & Ročník
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistiky
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poslední aktivita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleSelection(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                          <div className="text-xs text-gray-400">
                            Slug: {category.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.subject}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.grade}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {category.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {category.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span>{category.materialCount} materiálů</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span>{category.userCount} uživatelů</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getStatusColor(category.status)}>
                        {getStatusName(category.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTimeAgo(category.lastActivity)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Vytvořeno: {formatDate(category.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(category)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryStatus(category.id)}
                          className={category.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {category.status === 'active' ? 'Deaktivovat' : 'Aktivovat'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                          disabled={deletingIds.has(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingIds.has(category.id) ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingCategory) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Upravit kategorii' : 'Nová kategorie'}
                </h3>
                <Button
                  variant="ghost"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Zavřít</span>
                  ×
                </Button>
              </div>
              
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-800">
                    <ul className="list-disc list-inside space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název kategorie
                  </label>
                  <Input
                    type="text"
                    placeholder="Zadejte název kategorie"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popis
                  </label>
                  <textarea
                    placeholder="Zadejte popis kategorie"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Předmět
                    </label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Vyberte předmět</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Český jazyk">Český jazyk</option>
                      <option value="Anglický jazyk">Anglický jazyk</option>
                      <option value="Fyzika">Fyzika</option>
                      <option value="Dějepis">Dějepis</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ročník
                    </label>
                    <Input
                      type="text"
                      placeholder="např. 1. - 9. třída"
                      value={formData.grade}
                      onChange={(e) => handleFormChange('grade', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barva
                  </label>
                  <div className="flex space-x-2">
                    {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 hover:border-gray-400 ${
                          formData.color === color ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleFormChange('color', color)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Zrušit
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {editingCategory ? 'Uložit změny' : 'Vytvořit kategorii'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentCategoriesPage;
