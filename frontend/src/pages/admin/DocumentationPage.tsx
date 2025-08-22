import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  BookOpen, 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Download,
  Eye,
  Clock,
  User,
  Code,
  Settings,
  RefreshCw,
  X
} from 'lucide-react';

interface DocumentationItem {
  id: string;
  title: string;
  content: string;
  category: 'user-guide' | 'api-docs' | 'admin-guide' | 'developer-guide' | 'troubleshooting';
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  version: string;
  views: number;
}

const DocumentationPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<DocumentationItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Simulate API call for documentation data
    const fetchDocumentation = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockDocuments: DocumentationItem[] = [
          {
            id: '1',
            title: 'Uživatelská příručka - První kroky',
            content: 'Kompletní průvodce pro nové uživatele platformy EduAI-Asistent...',
            category: 'user-guide',
            status: 'published',
            author: 'admin1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            tags: ['uživatelé', 'první kroky', 'návod'],
            version: '1.2',
            views: 1247
          },
          {
            id: '2',
            title: 'API Reference - REST Endpoints',
            content: 'Kompletní dokumentace všech dostupných API endpointů...',
            category: 'api-docs',
            status: 'published',
            author: 'admin2',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            tags: ['API', 'REST', 'endpointy', 'dokumentace'],
            version: '2.1',
            views: 892
          },
          {
            id: '3',
            title: 'Admin Panel - Správa uživatelů',
            content: 'Návod pro správce na správu uživatelských účtů a oprávnění...',
            category: 'admin-guide',
            status: 'published',
            author: 'admin1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
            tags: ['admin', 'uživatelé', 'oprávnění'],
            version: '1.0',
            views: 456
          },
          {
            id: '4',
            title: 'Vývojářská příručka - Architektura',
            content: 'Technická dokumentace architektury systému...',
            category: 'developer-guide',
            status: 'draft',
            author: 'admin2',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
            tags: ['architektura', 'vývoj', 'technické'],
            version: '0.9',
            views: 123
          },
          {
            id: '5',
            title: 'Řešení problémů - Časté dotazy',
            content: 'Seznam nejčastějších problémů a jejich řešení...',
            category: 'troubleshooting',
            status: 'published',
            author: 'admin1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
            tags: ['FAQ', 'problémy', 'řešení'],
            version: '1.1',
            views: 678
          }
        ];

        setDocuments(mockDocuments);
        setLoading(false);
      }, 1000);
    };

    fetchDocumentation();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user-guide':
        return <User className="w-4 h-4" />;
      case 'api-docs':
        return <Code className="w-4 h-4" />;
      case 'admin-guide':
        return <Settings className="w-4 h-4" />;
      case 'developer-guide':
        return <Code className="w-4 h-4" />;
      case 'troubleshooting':
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'user-guide':
        return 'Uživatelská příručka';
      case 'api-docs':
        return 'API dokumentace';
      case 'admin-guide':
        return 'Admin příručka';
      case 'developer-guide':
        return 'Vývojářská příručka';
      case 'troubleshooting':
        return 'Řešení problémů';
      default:
        return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Koncept';
      case 'published':
        return 'Publikováno';
      case 'archived':
        return 'Archivováno';
      default:
        return status;
    }
  };

  const exportDocumentation = () => {
    const data = {
      documents: filteredDocuments,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documentation-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání dokumentace...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dokumentace</h1>
          <p className="text-gray-600 mt-2">
            Správa a organizace systémové dokumentace
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nový dokument
          </Button>
          <Button onClick={exportDocumentation} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Celkem dokumentů</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {documents.length}
            </div>
            <p className="text-sm text-gray-600">Všechny dokumenty</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Publikováno</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {documents.filter(d => d.status === 'published').length}
            </div>
            <p className="text-sm text-gray-600">Aktivní dokumenty</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Koncepty</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {documents.filter(d => d.status === 'draft').length}
            </div>
            <p className="text-sm text-gray-600">Dokumenty v přípravě</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Celkem zobrazení</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {documents.reduce((sum, doc) => sum + doc.views, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Všechna zobrazení</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Hledat v dokumentaci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny kategorie</option>
                <option value="user-guide">Uživatelská příručka</option>
                <option value="api-docs">API dokumentace</option>
                <option value="admin-guide">Admin příručka</option>
                <option value="developer-guide">Vývojářská příručka</option>
                <option value="troubleshooting">Řešení problémů</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny stavy</option>
                <option value="draft">Koncept</option>
                <option value="published">Publikováno</option>
                <option value="archived">Archivováno</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Documentation List */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">Seznam dokumentů</h3>
        </div>
        <div className="p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Žádné dokumenty nenalezeny</p>
              <p className="text-sm">Zkuste upravit filtry nebo hledaný výraz</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(doc.category)}
                        <div>
                          <h4 className="font-medium text-lg">{doc.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(doc.status)}>
                              {getStatusLabel(doc.status)}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {getCategoryLabel(doc.category)}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              v{doc.version}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2">{doc.content}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{doc.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Vytvořeno: {doc.createdAt.toLocaleDateString('cs-CZ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{doc.views} zobrazení</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Tagy:</span>
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Zobrazit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Upravit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Stáhnout
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Smazat
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Documentation Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Category Distribution */}
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Rozdělení podle kategorií</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Array.from(new Set(documents.map(d => d.category))).map(category => {
                const count = documents.filter(d => d.category === category).length;
                const percentage = (count / documents.length) * 100;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium">{getCategoryLabel(category)}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{count}</div>
                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Poslední aktivity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {documents
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .slice(0, 5)
                .map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(doc.category)}
                      <span className="font-medium">{doc.title}</span>
                    </div>
                    <div className="text-right text-gray-500">
                      {doc.updatedAt.toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDocument(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Informace</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategorie:</span>
                      <span className="font-medium">{getCategoryLabel(selectedDocument.category)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={selectedDocument.status === 'published' ? 'default' : 'outline'}>
                        {selectedDocument.status === 'published' ? 'Publikováno' : 'Koncept'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Autor:</span>
                      <span className="font-medium">{selectedDocument.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verze:</span>
                      <span className="font-medium">{selectedDocument.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zobrazení:</span>
                      <span className="font-medium">{selectedDocument.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tagy</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 mt-4">Datumy</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vytvořeno:</span>
                      <span>{selectedDocument.createdAt.toLocaleDateString('cs-CZ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aktualizováno:</span>
                      <span>{selectedDocument.updatedAt.toLocaleDateString('cs-CZ')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Obsah</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedDocument.content}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-200 px-6 py-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Handle edit functionality
                  setSelectedDocument(null);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Upravit
              </Button>
              <Button
                onClick={() => {
                  // Handle download functionality
                  setSelectedDocument(null);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Stáhnout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nový dokument</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission
              setShowAddForm(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název dokumentu
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zadejte název dokumentu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Vyberte kategorii</option>
                  <option value="user-guide">Uživatelská příručka</option>
                  <option value="api-docs">API dokumentace</option>
                  <option value="admin-guide">Admin příručka</option>
                  <option value="developer-guide">Vývojářská příručka</option>
                  <option value="troubleshooting">Řešení problémů</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obsah
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zadejte obsah dokumentu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagy (oddělené čárkami)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Koncept</option>
                  <option value="published">Publikováno</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Zrušit
                </Button>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Vytvořit dokument
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationPage;
