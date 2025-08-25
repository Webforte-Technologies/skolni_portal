import React from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface UserBulkActionsProps {
  selectedCount: number;
  bulkAction: string;
  onBulkActionChange: (action: string) => void;
  onExecuteBulkAction: () => void;
  onClearSelection: () => void;
  loading?: boolean;
}

const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  selectedCount,
  bulkAction,
  onBulkActionChange,
  onExecuteBulkAction,
  onClearSelection,
  loading = false
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className="text-sm text-gray-600">
          {selectedCount} uživatelů vybráno
        </span>
        <select
          value={bulkAction}
          onChange={(e) => onBulkActionChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">Vyberte akci...</option>
          <option value="activate">Aktivovat</option>
          <option value="deactivate">Deaktivovat</option>
          <option value="addCredits">Přidat kredity</option>
          <option value="delete">Smazat</option>
        </select>
        <div className="flex gap-2">
          <Button 
            onClick={onExecuteBulkAction} 
            disabled={!bulkAction || loading}
            isLoading={loading}
          >
            Provést akci
          </Button>
          <Button 
            variant="outline" 
            onClick={onClearSelection}
            disabled={loading}
          >
            Zrušit výběr
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserBulkActions;
