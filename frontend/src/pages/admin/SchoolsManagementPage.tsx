import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Plus, Edit, Eye, Users, CreditCard, 
   MapPin, Phone, Mail
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface School {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  teacher_count: number;
  student_count: number;
  subscription_plan: string;
  credits_balance: number;
  created_at: string;
  is_active: boolean;
}

const SchoolsManagementPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSchools, setTotalSchools] = useState(0);
  const pageSize = 20;

  const { showToast } = useToast();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
        q: searchQuery
      });
      
      const res = await api.get<any>(`/admin/schools?${queryParams.toString()}`);
      setSchools(res.data.data.data || []);
      setTotalSchools(res.data.data.total || 0);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání škol' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalSchools / pageSize);

  const getSubscriptionPlanColor = (plan: string) => {
    const colorMap: Record<string, string> = {
      'basic': 'bg-gray-100 text-gray-800',
      'premium': 'bg-blue-100 text-blue-800',
      'enterprise': 'bg-purple-100 text-purple-800'
    };
    return colorMap[plan] || 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionPlanName = (plan: string) => {
    const nameMap: Record<string, string> = {
      'basic': 'Základní',
      'premium': 'Premium',
      'enterprise': 'Enterprise'
    };
    return nameMap[plan] || plan;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa škol</h1>
          <p className="text-gray-600 mt-1">Spravujte školy a jejich předplatná</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Nová škola
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <InputField
              name="search"
              label=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat podle názvu školy nebo města..."
              className="w-full"
            />
          </div>
          <Button onClick={() => { setCurrentPage(0); fetchSchools(); }} isLoading={loading}>
            <Search className="w-4 h-4 mr-2" />
            Hledat
          </Button>
        </div>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            {/* School Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{school.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {school.city || 'N/A'}{school.postal_code ? `, ${school.postal_code}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* School Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {school.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {school.email || 'N/A'}
              </div>
              {school.website && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <span>🌐</span>
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {school.website}
                  </a>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Učitelé</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{school.teacher_count || 0}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Studenti</span>
                </div>
                <div className="text-xl font-bold text-gray-900">{school.student_count || 0}</div>
              </div>
            </div>

            {/* Credits Information */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Celkové kredity školy</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">{(school.credits_balance || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Kredity jsou rozděleny mezi učitele školy
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Registrováno: {new Date(school.created_at).toLocaleDateString('cs-CZ')}
              </div>
              <div className={`w-3 h-3 rounded-full ${school.is_active ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={school.is_active ? 'Aktivní' : 'Neaktivní'} />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Zobrazeno {schools.length} z {totalSchools} škol
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
        </Card>
      )}

      {/* Empty State */}
      {!loading && schools.length === 0 && (
        <Card className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné školy nenalezeny</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? `Pro vyhledávání "${searchQuery}" nebyly nalezeny žádné výsledky.` : 'Zatím nejsou registrovány žádné školy.'}
          </p>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Přidat první školu
          </Button>
        </Card>
      )}
      </div>
    </AdminLayout>
  );
};

export default SchoolsManagementPage;
