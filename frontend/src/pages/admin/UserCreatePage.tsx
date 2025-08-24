import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserForm from '../../components/admin/UserForm';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const UserCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (userData: any) => {
    try {
      setLoading(true);
      
      const response = await api.post('/admin/users', userData);
      
      if (response.data.success) {
        showToast({ 
          type: 'success', 
          message: 'Uživatel byl úspěšně vytvořen' 
        });
        navigate('/admin/users');
      } else {
        showToast({ 
          type: 'error', 
          message: response.data.error || 'Chyba při vytváření uživatele' 
        });
      }
    } catch (error: any) {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.error || 'Chyba při vytváření uživatele';
      showToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vytvořit nového uživatele</h1>
            <p className="text-gray-600">Přidejte nového uživatele do systému</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informace o uživateli</h2>
                <p className="text-sm text-gray-500">
                  Vyplňte základní informace o novém uživateli
                </p>
              </div>
            </div>

            <UserForm
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

export default UserCreatePage;
