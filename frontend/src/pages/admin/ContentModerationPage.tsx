import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Eye,  AlertTriangle, Clock, User, FileText, Flag, Ban, Check, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge, Input } from '../../components/ui';


interface ModerationItem {
  id: string;
  type: 'material' | 'comment' | 'user_report' | 'ai_generated';
  title: string;
  description: string;
  author: string;
  authorId: string;
  school: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'inappropriate' | 'spam' | 'copyright' | 'quality' | 'other';
  aiScore: number;
  humanScore: number;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  flags: number;
  content: string;
  tags: string[];
  subject: string;
  grade: string;
}

const ContentModerationPage: React.FC = () => {
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);


  useEffect(() => {
    // Simulate API call for moderation data
    const fetchModerationData = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        const mockModerationItems: ModerationItem[] = [
          {
            id: '1',
            type: 'material',
            title: 'Matematické cvičení - Pythagorova věta',
            description: 'Cvičení obsahuje nevhodné obrázky a text',
            author: 'Jan Novák',
            authorId: 'user1',
            school: 'Gymnázium Jana Nerudy',
            status: 'pending',
            priority: 'high',
            category: 'inappropriate',
            aiScore: 0.87,
            humanScore: 0.0,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            flags: 3,
            content: 'Cvičení obsahuje nevhodné obrázky a text, který není vhodný pro žáky základní školy.',
            tags: ['matematika', 'geometrie', 'nevhodné'],
            subject: 'Matematika',
            grade: '8. třída'
          },
          {
            id: '2',
            type: 'comment',
            title: 'Komentář k materiálu',
            description: 'Spam komentář s odkazy na externí stránky',
            author: 'Petr Černý',
            authorId: 'user2',
            school: 'ZŠ TGM',
            status: 'reviewed',
            priority: 'medium',
            category: 'spam',
            aiScore: 0.92,
            humanScore: 0.95,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
            reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
            reviewedBy: 'admin1',
            flags: 1,
            content: 'Skvělý materiál! Podívejte se na můj web: www.mujweb.cz',
            tags: ['spam', 'odkazy'],
            subject: 'Všeobecné',
            grade: 'Všechny'
          },
          {
            id: '3',
            type: 'material',
            title: 'Anglická gramatika - Present Perfect',
            description: 'Materiál s chybami a špatnou kvalitou',
            author: 'Marie Svobodová',
            authorId: 'user3',
            school: 'ZŠ Komenského',
            status: 'pending',
            priority: 'low',
            category: 'quality',
            aiScore: 0.45,
            humanScore: 0.0,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
            flags: 2,
            content: 'Materiál obsahuje gramatické chyby a není vhodný pro výuku.',
            tags: ['angličtina', 'gramatika', 'chyby'],
            subject: 'Anglický jazyk',
            grade: '6. třída'
          },
          {
            id: '4',
            type: 'user_report',
            title: 'Nahlášení uživatele',
            description: 'Uživatel nahlášen za nevhodné chování',
            author: 'Tomáš Malý',
            authorId: 'user4',
            school: 'SŠ technická',
            status: 'pending',
            priority: 'critical',
            category: 'inappropriate',
            aiScore: 0.78,
            humanScore: 0.0,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
            flags: 5,
            content: 'Uživatel opakovaně porušuje pravidla komunity.',
            tags: ['uživatel', 'nahlášení', 'kritické'],
            subject: 'Správa',
            grade: 'Všechny'
          },
          {
            id: '5',
            type: 'ai_generated',
            title: 'AI generovaný materiál - Fyzika',
            description: 'Materiál vygenerovaný AI s podezřelým obsahem',
            author: 'AI Assistant',
            authorId: 'ai1',
            school: 'Systém',
            status: 'reviewed',
            priority: 'medium',
            category: 'quality',
            aiScore: 0.65,
            humanScore: 0.70,
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
            reviewedBy: 'admin2',
            flags: 1,
            content: 'AI generovaný materiál vyžaduje lidskou kontrolu.',
            tags: ['AI', 'fyzika', 'kontrola'],
            subject: 'Fyzika',
            grade: '9. třída'
          }
        ];
        setModerationItems(mockModerationItems);
        setLoading(false);
      }, 1000);
    };

    fetchModerationData();
  }, []);

  const getStatusColor = (status: ModerationItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'flagged':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ModerationItem['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: ModerationItem['type']) => {
    switch (type) {
      case 'material':
        return <FileText className="w-5 h-5" />;
      case 'comment':
        return <User className="w-5 h-5" />;
      case 'user_report':
        return <Flag className="w-5 h-5" />;
      case 'ai_generated':
        return <Shield className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusName = (status: ModerationItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Čekající';
      case 'reviewed':
        return 'Kontrolováno';
      case 'approved':
        return 'Schváleno';
      case 'rejected':
        return 'Zamítnuto';
      case 'flagged':
        return 'Označeno';
      default:
        return 'Neznámý';
    }
  };

  const getPriorityName = (priority: ModerationItem['priority']) => {
    switch (priority) {
      case 'low':
        return 'Nízká';
      case 'medium':
        return 'Střední';
      case 'high':
        return 'Vysoká';
      case 'critical':
        return 'Kritická';
      default:
        return 'Neznámá';
    }
  };

  const getCategoryName = (category: ModerationItem['category']) => {
    switch (category) {
      case 'inappropriate':
        return 'Nevhodný obsah';
      case 'spam':
        return 'Spam';
      case 'copyright':
        return 'Autorská práva';
      case 'quality':
        return 'Kvalita';
      case 'other':
        return 'Jiné';
      default:
        return 'Neznámé';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
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

  const approveItem = (id: string) => {
    setModerationItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: 'approved' as const, reviewedAt: new Date(), reviewedBy: 'current_admin' }
          : item
      )
    );
  };

  const rejectItem = (id: string) => {
    setModerationItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: 'rejected' as const, reviewedAt: new Date(), reviewedBy: 'current_admin' }
          : item
      )
    );
  };

  const flagItem = (id: string) => {
    setModerationItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: 'flagged' as const, flags: item.flags + 1 }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setModerationItems(prev => prev.filter(item => item.id !== id));
  };

  const deleteSelected = () => {
    setModerationItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const filteredItems = moderationItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.school.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const pendingCount = moderationItems.filter(item => item.status === 'pending').length;
  const highPriorityCount = moderationItems.filter(item => item.priority === 'high' || item.priority === 'critical').length;
  const totalFlags = moderationItems.reduce((sum, item) => sum + item.flags, 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání moderování...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Moderování obsahu</h1>
            <p className="text-gray-600">Správa a kontrola obsahu na platformě</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {selectedItems.length > 0 && (
              <Button
                variant="danger"
                onClick={deleteSelected}
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Smazat vybrané ({selectedItems.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající na kontrolu</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vysoká priorita</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem označení</p>
                <p className="text-2xl font-bold text-orange-600">{totalFlags}</p>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem položek</p>
                <p className="text-2xl font-bold text-gray-900">{moderationItems.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
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
                <option value="pending">Čekající</option>
                <option value="reviewed">Kontrolováno</option>
                <option value="approved">Schváleno</option>
                <option value="rejected">Zamítnuto</option>
                <option value="flagged">Označeno</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny priority</option>
                <option value="low">Nízká</option>
                <option value="medium">Střední</option>
                <option value="high">Vysoká</option>
                <option value="critical">Kritická</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny typy</option>
                <option value="material">Materiály</option>
                <option value="comment">Komentáře</option>
                <option value="user_report">Nahlášení</option>
                <option value="ai_generated">AI generované</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat v moderování..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Moderation Items Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obsah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI skóre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.subject} • {item.grade}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.author}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.school}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getTimeAgo(item.submittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'material' ? 'Materiál' :
                         item.type === 'comment' ? 'Komentář' :
                         item.type === 'user_report' ? 'Nahlášení' : 'AI generované'}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {getCategoryName(item.category)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {getPriorityName(item.priority)}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.flags} označení
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getStatusName(item.status)}
                      </Badge>
                      {item.reviewedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          Kontroloval: {item.reviewedBy}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        AI: {(item.aiScore * 100).toFixed(0)}%
                      </div>
                      {item.humanScore > 0 && (
                        <div className="text-sm text-gray-500">
                          Lidské: {(item.humanScore * 100).toFixed(0)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {item.aiScore > 0.8 ? 'Vysoké riziko' :
                         item.aiScore > 0.6 ? 'Střední riziko' : 'Nízké riziko'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveItem(item.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejectItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => flagItem(item.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Review Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Kontrola obsahu: {selectedItem.title}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Detaily</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Autor:</span> {selectedItem.author}</div>
                      <div><span className="font-medium">Škola:</span> {selectedItem.school}</div>
                      <div><span className="font-medium">Předmět:</span> {selectedItem.subject}</div>
                      <div><span className="font-medium">Ročník:</span> {selectedItem.grade}</div>
                      <div><span className="font-medium">Kategorie:</span> {getCategoryName(selectedItem.category)}</div>
                      <div><span className="font-medium">Priorita:</span> {getPriorityName(selectedItem.priority)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skóre</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">AI skóre:</span> {(selectedItem.aiScore * 100).toFixed(0)}%</div>
                      <div><span className="font-medium">Lidské skóre:</span> {(selectedItem.humanScore * 100).toFixed(0)}%</div>
                      <div><span className="font-medium">Označení:</span> {selectedItem.flags}</div>
                      <div><span className="font-medium">Vytvořeno:</span> {formatDate(selectedItem.submittedAt)} {formatTime(selectedItem.submittedAt)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Popis problému</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedItem.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tagy</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Obsah</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-40 overflow-y-auto">
                    {selectedItem.content}
                  </div>
                </div>
                
                {selectedItem.status === 'pending' && (
                  <div className="flex items-center justify-center space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        approveItem(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      <span>Schválit</span>
                    </Button>
                    <Button
                      onClick={() => {
                        rejectItem(selectedItem.id);
                        setSelectedItem(null);
                      }}
                      variant="danger"
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Zamítnout</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentModerationPage;
