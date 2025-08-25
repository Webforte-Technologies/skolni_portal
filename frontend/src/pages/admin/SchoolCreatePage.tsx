import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import SchoolForm from '../../components/admin/SchoolForm';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const SchoolCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (schoolData: any) => {
    try {
      setLoading(true);
      
      const response = await api.post('/admin/schools', schoolData);
      
      if (response.data.success) {
        showToast({ 
          type: 'success', 
          message: 'Škola byla úspěšně vytvořena' 
        });
        navigate('/admin/schools');
      } else {
        showToast({ 
          type: 'error', 
          message: response.data.error || 'Chyba při vytváření školy' 
        });
      }
    } catch (error: any) {
      console.error('Create school error:', error);
      const errorMessage = error.response?.data?.error || 'Chyba při vytváření školy';
      showToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/schools');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Vytvořit novou školu</h1>
            <p className="text-gray-600">Přidejte novou školu do systému</p>
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
                  Vyplňte základní informace o nové škole
                </p>
              </div>
            </div>

            <SchoolForm
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

export default SchoolCreatePage;
