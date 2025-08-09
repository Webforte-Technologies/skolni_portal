import React, { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">Můj profil</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>Upravit profil</Button>
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">Zpět na dashboard</Button>
            </Link>
          </div>
        </div>
        <Card>
          {loading ? (
            <div className="py-12 text-center text-neutral-500">Načítání…</div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-neutral-500">Jméno</div>
                  <div className="text-base font-medium dark:text-neutral-100">{data.name}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500">Email</div>
                <div className="text-base font-medium break-all dark:text-neutral-100">{data.email}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-500">Aktuální kredity</div>
                  <div className="text-base font-medium dark:text-neutral-100">{data.credits}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Člen od</div>
                  <div className="text-base font-medium dark:text-neutral-100">{formatDate(data.createdAt)}</div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </main>
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

export default ProfilePage;


