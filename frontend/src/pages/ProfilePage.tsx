import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, CreditCard, ArrowLeft, Edit3 } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EditProfileModal from '../components/dashboard/EditProfileModal';
import { Link } from 'react-router-dom';
import { api } from '../services/apiClient';

interface MeResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    credits: number;
    createdAt: string;
  };
  error?: string;
}

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MeResponse['data'] | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<MeResponse['data']>('/users/me');
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        } else {
          setError(res.data.error || 'Nepodařilo se načíst profil');
        }
      } catch (e: any) {
        setError(e?.message || 'Nepodařilo se načíst profil');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('cs-CZ');
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Zpět
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">Můj profil</h1>
              <p className="text-gray-600 dark:text-neutral-400">Spravujte své osobní údaje a nastavení</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsEditOpen(true)} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Upravit profil
          </Button>
        </div>

        {loading ? (
          /* Loading State */
          <div className="space-y-6">
            <Card className="overflow-hidden">
              {/* Header Skeleton */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="w-48 h-8 bg-white/20 rounded animate-pulse mb-2"></div>
                    <div className="w-64 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              {/* Content Skeleton */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ) : error ? (
          /* Error State */
          <Card>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chyba při načítání profilu</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Zkusit znovu
              </Button>
            </div>
          </Card>
        ) : data ? (
          /* Profile Content */
          <Card className="overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">
                    {data.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white truncate">{data.name}</h2>
                  <p className="text-blue-100 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {data.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <CreditCard className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-100">
                      {data.credits} {data.credits === 1 ? 'kredit' : data.credits < 5 ? 'kredity' : 'kreditů'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Info */}
                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Osobní údaje</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-neutral-400">Celé jméno</span>
                      <p className="font-medium text-gray-900 dark:text-neutral-100">{data.name}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Kontaktní údaje</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-neutral-400">Email</span>
                      <p className="font-medium text-gray-900 dark:text-neutral-100 break-all">{data.email}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Informace o účtu</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-neutral-400">Člen od</span>
                      <p className="font-medium text-gray-900 dark:text-neutral-100">{formatDate(data.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credits Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Aktuální kredity
                    </h3>
                    <p className="text-gray-600 dark:text-neutral-400 text-sm mt-1">
                      Kredity slouží k využívání AI funkcí platformy
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{data.credits}</div>
                    <div className="text-sm text-gray-500 dark:text-neutral-400">
                      {data.credits === 1 ? 'kredit' : data.credits < 5 ? 'kredity' : 'kreditů'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Upravit profil
                </Button>
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Zpět na dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      </main>
    </div>
  );
};

export default ProfilePage;


