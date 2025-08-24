import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserForm from '../../components/admin/UserForm';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { User as UserType } from '../../types';

const UserEditPage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { showToast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/admin/users/${userId}`);
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        showToast({ 
          type: 'error', 
          message: 'Uživatel nebyl nalezen' 
        });
        navigate('/admin/users');
      }
    } catch (error: any) {
      console.error('Fetch user error:', error);
      const errorMessage = error.response?.data?.error || 'Chyba při načítání uživatele';
      showToast({ type: 'error', message: errorMessage });
      navigate('/admin/users');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (userData: any) => {
    try {
      setLoading(true);
      
      const response = await api.put(`/admin/users/${userId}`, userData);
      
      if (response.data.success) {
        showToast({ 
          type: 'success', 
          message: 'Uživatel byl úspěšně aktualizován' 
        });
        navigate('/admin/users');
      } else {
        showToast({ 
          type: 'error', 
          message: response.data.error || 'Chyba při aktualizaci uživatele' 
        });
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.error || 'Chyba při aktualizaci uživatele';
      showToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Načítání uživatele...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Uživatel nebyl nalezen</p>
          <Button onClick={handleCancel} className="mt-4">
            Zpět na seznam uživatelů
          </Button>
        </div>
      </AdminLayout>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Upravit uživatele</h1>
            <p className="text-gray-600">
              Upravte informace o uživateli {user.first_name} {user.last_name}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informace o uživateli</h2>
                <p className="text-sm text-gray-500">
                  Upravte základní informace o uživateli
                </p>
              </div>
            </div>

            <UserForm
              user={user}
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

export default UserEditPage;
