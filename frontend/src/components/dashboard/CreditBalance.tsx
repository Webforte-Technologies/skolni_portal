import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Coins } from 'lucide-react';

const CreditBalance: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-100">Kredity</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
            {user.credits_balance}
          </div>
          <div className="text-xs text-gray-500 dark:text-neutral-400">dostupné</div>
        </div>
      </div>
    </div>
  );
};

export default CreditBalance; 