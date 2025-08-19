import React from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { User, Calendar, School, Edit } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { UserWithSchool } from '../../types';

interface ResponsiveUserInfoProps {
  user: UserWithSchool;
  onEditProfile: () => void;
}

/**
 * Responsive user information component that adapts layout based on screen size
 * - Mobile: Compact layout with smaller text and icons
 * - Desktop: Full layout with larger elements
 */
const ResponsiveUserInfo: React.FC<ResponsiveUserInfoProps> = ({
  user,
  onEditProfile,
}) => {
  const { viewport, state } = useResponsive();
  const { isMobile } = state;

  return (
    <Card 
      title="Informace o účtu"
      mobileLayout={isMobile ? "compact" : "expanded"}
      touchActions={viewport.touchDevice}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 dark:text-neutral-400" />
          <h3 className={`font-semibold dark:text-neutral-100 ${isMobile ? 'text-sm' : 'text-lg'}`}>
            Informace o účtu
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditProfile}
          className="h-8 w-8 p-0"
          style={{ minWidth: '44px', minHeight: '44px' }}
          aria-label="Upravit profil"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {/* User Avatar and Name */}
        <div className="flex items-center space-x-3">
          <div className={`bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
            <span className={`text-blue-600 dark:text-blue-400 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {user.first_name[0]}{user.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-gray-900 dark:text-neutral-100 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
              {user.first_name} {user.last_name}
            </p>
            <p className={`text-gray-500 dark:text-neutral-300 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {user.email}
            </p>
          </div>
        </div>
        
        {/* School Information */}
        {user.school && (
          <>
            <hr className="border-gray-200 dark:border-neutral-800" />
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 sm:p-2 bg-green-100 dark:bg-neutral-800 rounded-lg`}>
                <School className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 dark:text-neutral-100 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {user.school.name}
                </p>
                <p className={`text-gray-500 dark:text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Škola
                </p>
              </div>
            </div>
          </>
        )}
        
        {/* Member Since */}
        <hr className="border-gray-200 dark:border-neutral-800" />
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 sm:p-2 bg-purple-100 dark:bg-neutral-800 rounded-lg`}>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-gray-900 dark:text-neutral-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
              {new Date(user.created_at).toLocaleDateString('cs-CZ')}
            </p>
            <p className={`text-gray-500 dark:text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Člen od
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResponsiveUserInfo;