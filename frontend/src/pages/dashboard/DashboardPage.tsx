import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { assistantService } from '../../services/assistantService';
import Header from '../../components/layout/Header';
import CreditBalance from '../../components/dashboard/CreditBalance';
import AssistantCard from '../../components/dashboard/AssistantCard';
import { AIFeature } from '../../types';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<AIFeature[]>([]);

  // Fetch AI features
  const { data: aiFeatures, isLoading: featuresLoading } = useQuery(
    'aiFeatures',
    assistantService.getFeatures,
    {
      onSuccess: (data) => {
        setFeatures(data);
      },
      onError: (error) => {
        console.error('Failed to load AI features:', error);
      },
    }
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Vítejte, {user.first_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Vyberte si AI asistenta pro pomoc s vaší výukou
          </p>
        </div>

        {/* Credit balance */}
        <div className="mb-8">
          <CreditBalance />
        </div>

        {/* AI Assistants */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            AI Asistenti
          </h2>
          
          {featuresLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Načítání asistentů...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <AssistantCard key={feature.id} feature={feature} />
              ))}
            </div>
          )}
        </div>

        {/* User info card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informace o účtu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Jméno</p>
              <p className="text-gray-900">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
            {user.school && (
              <div>
                <p className="text-sm font-medium text-gray-500">Škola</p>
                <p className="text-gray-900">{user.school.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Člen od</p>
              <p className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString('cs-CZ')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 