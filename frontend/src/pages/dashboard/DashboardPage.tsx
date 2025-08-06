import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { assistantService } from '../../services/assistantService';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import Header from '../../components/layout/Header';
import AssistantCard from '../../components/dashboard/AssistantCard';
import EditProfileModal from '../../components/dashboard/EditProfileModal';
import { AIFeature } from '../../types';
import { Loader2, User, Calendar, School, Sparkles, Edit, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [features, setFeatures] = useState<AIFeature[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  // Fetch AI features
  const { isLoading: featuresLoading } = useQuery(
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

  // Handle adding demo credits
  const handleAddCredits = async () => {
    try {
      setIsAddingCredits(true);
      const result = await authService.addDemoCredits();
      updateUser(result.user);
      showToast({ type: 'success', message: `Přidáno ${result.credits_added} demo kreditů!` });
    } catch (error) {
      console.error('Failed to add credits:', error);
      showToast({ type: 'error', message: 'Nepodařilo se přidat kredity. Zkuste to prosím znovu.' });
    } finally {
      setIsAddingCredits(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Vítejte, {user.first_name}!
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Vyberte si AI asistenta pro pomoc s vaší výukou
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - AI Assistants */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
                AI Asistenti
              </h2>
              
              {featuresLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Načítání asistentů...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <AssistantCard key={feature.id} feature={feature} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - User info and credits */}
          <div className="space-y-6">
            {/* Credit Balance - Prominent display */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Vaše kredity</h3>
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{user.credits_balance}</div>
                <div className="text-blue-100 text-sm">dostupné kreditů</div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-blue-200 mb-4">
                  Každá zpráva stojí 1 kredit
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCredits}
                  disabled={isAddingCredits}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
                >
                  {isAddingCredits ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Přidávám...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      + Přidat 100 Demo Kreditů
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* User Account Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  Informace o účtu
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Upravit</span>
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {user.school && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <School className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.school.name}</p>
                      <p className="text-sm text-gray-500">Škola</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                    </p>
                    <p className="text-sm text-gray-500">Člen od</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rychlé statistiky
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dostupné kredity</span>
                  <span className="font-semibold text-blue-600">{user.credits_balance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dostupné asistenty</span>
                  <span className="font-semibold text-green-600">{features.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status účtu</span>
                  <span className="font-semibold text-green-600">Aktivní</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
};

export default DashboardPage; 