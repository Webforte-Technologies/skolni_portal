import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText,  Search, Eye, Edit, 
  CheckCircle, XCircle, Clock, 
  BarChart3, Download, Plus
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface ContentMaterial {
  id: string;
  title: string;
  description: string;
  file_type: string;
  file_size: number;
  user_name: string;
  school_name?: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  quality_score?: number;
  created_at: string;
  updated_at: string;
  download_count: number;
  view_count: number;
}

interface ContentAnalytics {
  total_materials: number;
  pending_moderation: number;
  approved_materials: number;
  rejected_materials: number;
  total_downloads: number;
  total_views: number;
  quality_average: number;
  materials_by_type: Array<{ type: string; count: number }>;
  materials_by_status: Array<{ status: string; count: number }>;
}

const ContentManagementPage: React.FC = () => {
  const [materials, setMaterials] = useState<ContentMaterial[]>([]);
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const pageSize = 20;

  const { showToast } = useToast();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
        q: searchQuery
      });
      
      if (selectedStatus !== 'all') {
        queryParams.append('moderation_status', selectedStatus);
      }
      
      const res = await api.get<any>(`/admin/content/materials?${queryParams.toString()}`);
      setMaterials(res.data.data.data || []);
      setTotalMaterials(res.data.data.total || 0);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání materiálů' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, searchQuery, pageSize, showToast]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get<any>('/admin/content/analytics');
      setAnalytics(res.data.data);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání analytiky' });
    }
  }, [showToast]);

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, selectedStatus, searchQuery, fetchMaterials]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalPages = Math.ceil(totalMaterials / pageSize);

  const handleModerationDecision = async (materialId: string, status: 'approved' | 'rejected', qualityScore?: number) => {
    try {
      await api.post(`/admin/content/materials/${materialId}/moderate`, {
        status,
        quality_score: qualityScore
      });
      
      showToast({ 
        type: 'success', 
        message: `Materiál byl ${status === 'approved' ? 'schválen' : 'zamítnut'}` 
      });
      
      fetchMaterials();
      fetchAnalytics();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při moderování materiálu' });
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusName = (status: string) => {
    const nameMap: Record<string, string> = {
      'pending': 'Čeká na moderování',
      'approved': 'Schváleno',
      'rejected': 'Zamítnuto'
    };
    return nameMap[status] || status;
  };

  const getFileTypeIcon = (fileType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'pdf': <FileText className="w-4 h-4" />,
      'doc': <FileText className="w-4 h-4" />,
      'docx': <FileText className="w-4 h-4" />,
      'ppt': <FileText className="w-4 h-4" />,
      'pptx': <FileText className="w-4 h-4" />,
      'xls': <FileText className="w-4 h-4" />,
      'xlsx': <FileText className="w-4 h-4" />
    };
    return iconMap[fileType.toLowerCase()] || <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportMaterials = async () => {
    try {
      const res = await api.get('/admin/content/materials/export', { responseType: 'blob' });
      // When responseType is 'blob', the data is directly the blob
      const url = window.URL.createObjectURL(res.data as unknown as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `content-materials-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast({ type: 'success', message: 'Export materiálů byl stažen' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa obsahu</h1>
          <p className="text-gray-600 mt-1">Moderování a správa vzdělávacích materiálů</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportMaterials} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nový materiál
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-blue-700">Celkem materiálů</div>
                <div className="text-2xl font-bold text-blue-900">
                  {analytics.total_materials.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-yellow-700">Čeká na moderování</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {analytics.pending_moderation.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-700">Schváleno</div>
                <div className="text-2xl font-bold text-green-900">
                  {analytics.approved_materials.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-purple-700">Průměrná kvalita</div>
                <div className="text-2xl font-bold text-purple-900">
                  {analytics.quality_average.toFixed(1)}/10
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <InputField
              name="search"
              label=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat podle názvu nebo popisu..."
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Stav:</span>
            <select 
              className="border border-gray-300 rounded-md p-2 bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Všechny stavy</option>
              <option value="pending">Čeká na moderování</option>
              <option value="approved">Schváleno</option>
              <option value="rejected">Zamítnuto</option>
            </select>
          </div>
          
          <Button onClick={() => { setCurrentPage(0); fetchMaterials(); }} isLoading={loading}>
            <Search className="w-4 h-4 mr-2" />
            Hledat
          </Button>
        </div>
      </Card>

      {/* Materials Table */}
      <Card title="Seznam materiálů" icon={<FileText className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Materiál</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Autor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Typ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stav</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Kvalita</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Statistiky</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Datum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Akce</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{material.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {material.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{material.user_name}</div>
                      {material.school_name && (
                        <div className="text-sm text-gray-500">{material.school_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getFileTypeIcon(material.file_type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{material.file_type.toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(material.file_size)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.moderation_status)}`}>
                      {getStatusName(material.moderation_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {material.quality_score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(material.quality_score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{material.quality_score}/10</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">
                      <div>Zobrazení: {material.view_count}</div>
                      <div>Stažení: {material.download_count}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">
                      <div>{new Date(material.created_at).toLocaleDateString('cs-CZ')}</div>
                      <div className="text-xs">
                        {new Date(material.updated_at).toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {material.moderation_status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleModerationDecision(material.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleModerationDecision(material.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button size="sm" variant="secondary">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Zobrazeno {materials.length} z {totalMaterials} materiálů
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                disabled={currentPage <= 0} 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              >
                Předchozí
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage + 1} / {Math.max(1, totalPages)}
              </span>
              <Button 
                variant="secondary" 
                disabled={(currentPage + 1) >= totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Další
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && materials.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné materiály nenalezeny</h3>
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Pro vybrané filtry nebyly nalezeny žádné výsledky.' 
                : 'Zatím nejsou nahrány žádné materiály.'}
            </p>
          </div>
        )}
      </Card>
      </div>
    </AdminLayout>
  );
};

export default ContentManagementPage;
