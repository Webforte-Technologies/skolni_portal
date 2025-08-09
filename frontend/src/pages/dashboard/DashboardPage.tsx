import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { assistantService } from '../../services/assistantService';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import Header from '../../components/layout/Header';
import AssistantCard from '../../components/dashboard/AssistantCard';
import EditProfileModal from '../../components/dashboard/EditProfileModal';
import DashboardHero from '../../components/dashboard/DashboardHero';
import SparklineStatCard from '../../components/dashboard/SparklineStatCard';
import { AIFeature } from '../../types';
import { 
  Loader2, 
  User, 
  Calendar, 
  School, 
  Sparkles, 
  Edit, 
  Plus, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  // Fetch AI features
  const { data: features = [], isLoading: featuresLoading, error: featuresError } = useQuery(
    'aiFeatures',
    assistantService.getFeatures,
    {
      onError: (error) => {
        console.error('Failed to load AI features:', error);
        showToast({ type: 'error', message: 'Nepodařilo se načíst AI asistenty.' });
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
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 9.7.1 Hero Header */}
        <DashboardHero credits={user.credits_balance} />

        {/* Quick Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link to="/chat">
              <Button size="lg" className="shadow-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat s AI
              </Button>
            </Link>
            <Link to="/materials">
              <Button variant="outline" size="lg" className="shadow-sm">
                <FileText className="h-4 w-4 mr-2" />
                Moje materiály
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - AI Assistants */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="AI Asistenti">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold dark:text-neutral-100">AI Asistenti</h3>
                </div>
                <p className="text-gray-600 dark:text-neutral-300 text-sm">Vyberte si asistenta podle vašich potřeb</p>
              </div>
              {featuresLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-gray-500 dark:text-neutral-300">Načítání asistentů...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <AssistantCard key={feature.id} feature={feature} />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credit Balance */}
            <Card title="Vaše kredity" className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-1">{user.credits_balance}</div>
                <div className="text-white/80 text-sm">dostupné kreditů</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/70 mb-4">
                  Každá zpráva stojí 1 kredit
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCredits}
                  disabled={isAddingCredits}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
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
            </Card>

            {/* User Account Information */}
            <Card title="Informace o účtu">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500 dark:text-neutral-400" />
                  <h3 className="text-lg font-semibold dark:text-neutral-100">Informace o účtu</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-neutral-100">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-neutral-300">{user.email}</p>
                  </div>
                </div>
                
                {user.school && (
                  <>
                    <hr className="border-gray-200 dark:border-neutral-800" />
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-neutral-800 rounded-lg">
                        <School className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-neutral-100">{user.school.name}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-300">Škola</p>
                      </div>
                    </div>
                  </>
                )}
                
                <hr className="border-gray-200 dark:border-neutral-800" />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-neutral-800 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-neutral-100">
                      {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-neutral-300">Člen od</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card title="Rychlé statistiky">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2 text-gray-500 dark:text-neutral-400" />
                <h3 className="text-lg font-semibold dark:text-neutral-100">Rychlé statistiky</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-neutral-300">Dostupné kredity</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded text-sm">
                    {user.credits_balance}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-neutral-300">Dostupné asistenty</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded text-sm">
                    {features.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-neutral-300">Status účtu</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded text-sm flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Aktivní
                  </span>
                </div>
                {/* 9.7.3 Sparkline cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 items-stretch">
                  <SparklineStatCard title="Týdenní aktivita" value={42} />
                  <SparklineStatCard title="Počet zpráv" value={128} color="#10b981" />
                  <SparklineStatCard title="Vytvořená cvičení" value={8} color="#a78bfa" />
                </div>
              </div>
            </Card>
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