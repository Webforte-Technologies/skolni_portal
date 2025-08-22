import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Edit, Trash2, Phone, Building2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge, Input } from '../../components/ui';


interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  school: string;
  schoolId: string;
  subjects: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  role: 'teacher' | 'school_admin' | 'teacher_admin';
  joinDate: Date;
  lastActive: Date;
  creditsUsed: number;
  creditsRemaining: number;
  materialsCreated: number;
  isVerified: boolean;
}

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    // Simulate API call for teachers data
    const fetchTeachers = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        const mockTeachers: Teacher[] = [
          {
            id: '1',
            firstName: 'Jan',
            lastName: 'Novák',
            email: 'jan.novak@gymnazium-neruda.cz',
            phone: '+420 123 456 789',
            school: 'Gymnázium Jana Nerudy',
            schoolId: 'school1',
            subjects: ['Matematika', 'Fyzika'],
            status: 'active',
            role: 'teacher',
            joinDate: new Date('2023-09-01'),
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
            creditsUsed: 450,
            creditsRemaining: 550,
            materialsCreated: 23,
            isVerified: true
          },
          {
            id: '2',
            firstName: 'Marie',
            lastName: 'Svobodová',
            email: 'marie.svobodova@zs-tgm.cz',
            phone: '+420 987 654 321',
            school: 'ZŠ TGM',
            schoolId: 'school2',
            subjects: ['Český jazyk', 'Dějepis'],
            status: 'active',
            role: 'school_admin',
            joinDate: new Date('2023-08-15'),
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 6),
            creditsUsed: 320,
            creditsRemaining: 680,
            materialsCreated: 18,
            isVerified: true
          },
          {
            id: '3',
            firstName: 'Petr',
            lastName: 'Černý',
            email: 'petr.cerny@sst-technicka.cz',
            phone: '+420 555 123 456',
            school: 'SŠ technická',
            schoolId: 'school3',
            subjects: ['Informatika', 'Matematika'],
            status: 'pending',
            role: 'teacher',
            joinDate: new Date('2024-01-10'),
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
            creditsUsed: 0,
            creditsRemaining: 1000,
            materialsCreated: 0,
            isVerified: false
          },
          {
            id: '4',
            firstName: 'Anna',
            lastName: 'Veselá',
            email: 'anna.vesela@zs-komenskeho.cz',
            phone: '+420 777 888 999',
            school: 'ZŠ Komenského',
            schoolId: 'school4',
            subjects: ['Anglický jazyk', 'Německý jazyk'],
            status: 'inactive',
            role: 'teacher',
            joinDate: new Date('2023-06-01'),
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            creditsUsed: 280,
            creditsRemaining: 720,
            materialsCreated: 15,
            isVerified: true
          },
          {
            id: '5',
            firstName: 'Tomáš',
            lastName: 'Malý',
            email: 'tomas.maly@gymnazium-neruda.cz',
            phone: '+420 111 222 333',
            school: 'Gymnázium Jana Nerudy',
            schoolId: 'school1',
            subjects: ['Chemie', 'Biologie'],
            status: 'active',
            role: 'teacher',
            joinDate: new Date('2023-10-01'),
            lastActive: new Date(Date.now() - 1000 * 60 * 60 * 1),
            creditsUsed: 180,
            creditsRemaining: 820,
            materialsCreated: 12,
            isVerified: true
          }
        ];
        setTeachers(mockTeachers);
        setLoading(false);
      }, 1000);
    };

    fetchTeachers();
  }, []);

  const getStatusColor = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: Teacher['role']) => {
    switch (role) {
      case 'school_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teacher_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'teacher':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const formatLastActive = (date: Date) => {
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

  const approveTeacher = (id: string) => {
    setTeachers(prev => 
      prev.map(teacher => 
        teacher.id === id 
          ? { ...teacher, status: 'active' as const, isVerified: true }
          : teacher
      )
    );
  };

  const suspendTeacher = (id: string) => {
    setTeachers(prev => 
      prev.map(teacher => 
        teacher.id === id 
          ? { ...teacher, status: 'suspended' as const }
          : teacher
      )
    );
  };

  const activateTeacher = (id: string) => {
    setTeachers(prev => 
      prev.map(teacher => 
        teacher.id === id 
          ? { ...teacher, status: 'active' as const }
          : teacher
      )
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(teacher => teacher.id !== id));
  };

  const deleteSelected = () => {
    setTeachers(prev => prev.filter(teacher => !selectedTeachers.includes(teacher.id)));
    setSelectedTeachers([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedTeachers(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchQuery === '' || 
      teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.school.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || teacher.schoolId === schoolFilter;

    return matchesSearch && matchesStatus && matchesSchool;
  });

  const schools = Array.from(new Set(teachers.map(t => ({ id: t.schoolId, name: t.school }))));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání učitelů...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Správa učitelů</h1>
            <p className="text-gray-600">Přehled a správa všech učitelů na platformě</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat učitele</span>
            </Button>
            {selectedTeachers.length > 0 && (
              <Button
                variant="danger"
                onClick={deleteSelected}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat vybrané ({selectedTeachers.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem učitelů</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní</p>
                <p className="text-2xl font-bold text-green-600">
                  {teachers.filter(t => t.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající na schválení</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {teachers.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nepotvrzení</p>
                <p className="text-2xl font-bold text-red-600">
                  {teachers.filter(t => !t.isVerified).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
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
                <option value="pending">Čekající</option>
                <option value="suspended">Pozastavení</option>
              </select>
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny školy</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat učitele..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Teachers Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeachers(filteredTeachers.map(t => t.id));
                        } else {
                          setSelectedTeachers([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Učitel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Škola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Předměty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kredity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktivita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={() => toggleSelection(teacher.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {teacher.firstName[0]}{teacher.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{teacher.email}</div>
                          {teacher.phone && (
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{teacher.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{teacher.school}</span>
                      </div>
                      <Badge variant="outline" className={getRoleColor(teacher.role)}>
                        {teacher.role === 'school_admin' ? 'Správce školy' : 
                         teacher.role === 'teacher_admin' ? 'Správce učitelů' : 'Učitel'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getStatusColor(teacher.status)}>
                        {teacher.status === 'active' ? 'Aktivní' :
                         teacher.status === 'inactive' ? 'Neaktivní' :
                         teacher.status === 'pending' ? 'Čekající' : 'Pozastavení'}
                      </Badge>
                      {!teacher.isVerified && (
                        <Badge variant="warning" className="ml-2">Nepotvrzený</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Použito: {teacher.creditsUsed}</div>
                        <div className="text-green-600">Zbývá: {teacher.creditsRemaining}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Materiálů: {teacher.materialsCreated}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Připojen: {formatDate(teacher.joinDate)}</div>
                        <div className="text-gray-500">Poslední aktivita: {formatLastActive(teacher.lastActive)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTeacher(teacher)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {teacher.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveTeacher(teacher.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {teacher.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => suspendTeacher(teacher.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {teacher.status === 'suspended' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => activateTeacher(teacher.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTeacher(teacher.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TeachersPage;
