import { useState } from 'react';
import { useQuery as useReactQuery } from 'react-query';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { assistantService } from '../../services/assistantService';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import { useResponsive } from '../../contexts/ResponsiveContext';
import Header from '../../components/layout/Header';
import AssistantCard from '../../components/dashboard/AssistantCard';
import EditProfileModal from '../../components/dashboard/EditProfileModal';
import DashboardHero from '../../components/dashboard/DashboardHero';
import ResponsiveCardGrid from '../../components/ui/ResponsiveCardGrid';
import ResponsiveCreditDisplay from '../../components/dashboard/ResponsiveCreditDisplay';
import ResponsiveUserInfo from '../../components/dashboard/ResponsiveUserInfo';
import ResponsiveQuickStats from '../../components/dashboard/ResponsiveQuickStats';
import { 
  Loader2, 
  Sparkles, 
  FileText, 
  MessageSquare,
  Users
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { viewport, state } = useResponsive();
  const { isMobile, isTablet } = state;
  
  useReactQuery('me-profile', authService.getProfile, {
    enabled: !!user,
    refetchOnWindowFocus: true,
    onSuccess: (fresh) => updateUser(fresh),
  });
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  // Fetch AI features
  const { data: features = [], isLoading: featuresLoading } = useQuery(
    'aiFeatures',
    assistantService.getFeatures,
    {
      onError: async (error) => {
        const { errorToMessage } = await import('../../services/apiClient');
        showToast({ type: 'error', message: errorToMessage(error) });
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
      const { errorToMessage } = await import('../../services/apiClient');
      showToast({ type: 'error', message: errorToMessage(error) });
    } finally {
      setIsAddingCredits(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Header - Mobile optimized */}
        <div className="mb-6 sm:mb-8">
          <DashboardHero credits={user.credits_balance} />
        </div>

        {/* Quick Navigation - Mobile-first responsive */}
        <div className="mb-6 sm:mb-8">
          <div className={`
            flex gap-2 sm:gap-3 lg:gap-4
            ${isMobile ? 'flex-col' : 'flex-wrap'}
          `}>
            <Link to="/chat" className={isMobile ? 'w-full' : ''}>
              <Button 
                size={isMobile ? "lg" : "lg"} 
                className={`shadow-sm ${isMobile ? 'w-full justify-center' : ''}`}
                style={{ minHeight: '44px' }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat s AI
              </Button>
            </Link>
            <Link to="/materials" className={isMobile ? 'w-full' : ''}>
              <Button 
                variant="outline" 
                size={isMobile ? "lg" : "lg"} 
                className={`shadow-sm ${isMobile ? 'w-full justify-center' : ''}`}
                style={{ minHeight: '44px' }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Materiály
              </Button>
            </Link>
            <Link to="/materials/shared" className={isMobile ? 'w-full' : ''}>
              <Button 
                variant="outline" 
                size={isMobile ? "lg" : "lg"} 
                className={`shadow-sm ${isMobile ? 'w-full justify-center' : ''}`}
                style={{ minHeight: '44px' }}
              >
                <Users className="h-4 w-4 mr-2" />
                Sdílené materiály
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile-first responsive grid layout */}
        <div className={`
          ${isMobile 
            ? 'space-y-6' 
            : isTablet 
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
              : 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'
          }
        `}>
          
          {/* Credit Balance Card - Priority on mobile */}
          {isMobile && (
            <ResponsiveCreditDisplay
              credits={user.credits_balance}
              onAddCredits={handleAddCredits}
              isAddingCredits={isAddingCredits}
            />
          )}

          {/* Main content - AI Assistants */}
          <div className={`
            ${isMobile 
              ? '' 
              : isTablet 
                ? 'lg:col-span-1' 
                : 'lg:col-span-2'
            }
          `}>
            <Card 
              title="AI Asistenti"
              mobileLayout={isMobile ? "compact" : "expanded"}
              touchActions={viewport.touchDevice}
            >
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className={`font-semibold dark:text-neutral-100 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    AI Asistenti
                  </h3>
                </div>
                <p className={`text-gray-600 dark:text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Vyberte si asistenta podle vašich potřeb
                </p>
              </div>
              {featuresLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-gray-500 dark:text-neutral-300 text-sm">
                    Načítání asistentů...
                  </span>
                </div>
              ) : (
                <ResponsiveCardGrid
                  columns={{
                    mobile: 1,
                    tablet: 1,
                    desktop: 2
                  }}
                  gap={isMobile ? "sm" : "md"}
                  minCardWidth="280px"
                  adaptiveStacking={true}
                >
                  {features.map((feature) => (
                    <AssistantCard key={feature.id} feature={feature} />
                  ))}
                </ResponsiveCardGrid>
              )}
            </Card>
          </div>

          {/* Sidebar - Stacked on mobile, sidebar on desktop */}
          <div className={`
            ${isMobile 
              ? 'space-y-4' 
              : isTablet 
                ? 'lg:col-span-1 space-y-6' 
                : 'space-y-6'
            }
          `}>
            
            {/* Credit Balance - Desktop/Tablet only */}
            {!isMobile && (
              <ResponsiveCreditDisplay
                credits={user.credits_balance}
                onAddCredits={handleAddCredits}
                isAddingCredits={isAddingCredits}
              />
            )}

            {/* User Account Information */}
            <ResponsiveUserInfo
              user={user}
              onEditProfile={() => setIsEditModalOpen(true)}
            />

            {/* Quick Stats */}
            <ResponsiveQuickStats
              creditsBalance={user.credits_balance}
              featuresCount={features.length}
            />
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