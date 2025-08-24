import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import SchoolForm from '../../components/admin/SchoolForm';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { School } from '../../types';

const SchoolEditPage: React.FC = () => {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();
  const { showToast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchSchool();
    }
  }, [schoolId]);

  const fetchSchool = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/admin/schools/${schoolId}`);
      
      if (response.data.success) {
        setSchool(response.data.data);
      } else {
        showToast({ 
          type: 'error', 
          message: 'Škola nebyla nalezena' 
        });
        navigate('/admin/schools');
      }
    } catch (error: any) {
      console.error('Fetch school error:', error);
      const errorMessage = error.response?.data?.error || 'Chyba při načítání školy';
      showToast({ type: 'error', message: errorMessage });
      navigate('/admin/schools');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (schoolData: any) => {
    try {
      setLoading(true);
      
      const response = await api.put(`/admin/schools/${schoolId}`, schoolData);
      
      if (response.data.success) {
        showToast({ 
          type: 'success', 
          message: 'Škola byla úspěšně aktualizována' 
        });
        navigate('/admin/schools');
      } else {
        showToast({ 
          type: 'error', 
          message: response.data.error || 'Chyba při aktualizaci školy' 
        });
      }
    } catch (error: any) {
      console.error('Update school error:', error);
      const errorMessage = error.response?.data?.error || 'Chyba při aktualizaci školy';
      showToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/schools');
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Načítání školy...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!school) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Škola nebyla nalezena</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Zpět na seznam škol
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upravit školu</h1>
            <p className="text-gray-600">
              Upravte informace o škole {school.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informace o škole</h2>
                <p className="text-sm text-gray-500">
                  Upravte základní informace o škole
                </p>
              </div>
            </div>

            <SchoolForm
              school={school}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SchoolEditPage;
