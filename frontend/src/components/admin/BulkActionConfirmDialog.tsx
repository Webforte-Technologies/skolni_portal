import React, { useState } from 'react';
import { AlertTriangle, Users, Trash2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';

interface BulkActionConfirmDialogProps {
  isOpen: boolean;
  action: string;
  selectedUsers: any[];
  onConfirm: (data?: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BulkActionConfirmDialog: React.FC<BulkActionConfirmDialogProps> = ({
  isOpen,
  action,
  selectedUsers,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [confirmText, setConfirmText] = useState<string>('');

  if (!isOpen) return null;

  const getActionDetails = () => {
    switch (action) {
      case 'activate':
        return {
          title: 'Aktivovat uživatele',
          description: 'Tato akce aktivuje vybrané uživatele. Budou se moci přihlásit a používat systém.',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          confirmButtonText: 'Aktivovat uživatele',
          confirmButtonVariant: 'primary' as const,
          isDestructive: false,
          requiresConfirmation: false
        };
      case 'deactivate':
        return {
          title: 'Deaktivovat uživatele',
          description: 'Tato akce deaktivuje vybrané uživatele. Nebudou se moci přihlásit do systému.',
          icon: <XCircle className="w-6 h-6 text-orange-600" />,
          confirmButtonText: 'Deaktivovat uživatele',
          confirmButtonVariant: 'outline' as const,
          isDestructive: false,
          requiresConfirmation: false
        };
      case 'addCredits':
        return {
          title: 'Přidat kredity',
          description: 'Tato akce přidá zadaný počet kreditů všem vybraným uživatelům.',
          icon: <CreditCard className="w-6 h-6 text-blue-600" />,
          confirmButtonText: 'Přidat kredity',
          confirmButtonVariant: 'primary' as const,
          isDestructive: false,
          requiresConfirmation: false
        };
      case 'delete':
        return {
          title: 'Smazat uživatele',
          description: 'Tato akce trvale smaže vybrané uživatele. Tuto akci nelze vrátit zpět!',
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          confirmButtonText: 'Smazat uživatele',
          confirmButtonVariant: 'danger' as const,
          isDestructive: true,
          requiresConfirmation: true
        };
      default:
        return {
          title: 'Potvrdit akci',
          description: 'Opravdu chcete provést tuto akci?',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          confirmButtonText: 'Potvrdit',
          confirmButtonVariant: 'primary' as const,
          isDestructive: false,
          requiresConfirmation: false
        };
    }
  };

  const actionDetails = getActionDetails();
  const canConfirm = !actionDetails.requiresConfirmation || 
    (actionDetails.requiresConfirmation && confirmText === 'SMAZAT');

  const handleConfirm = () => {
    if (!canConfirm) return;

    const data: any = {};
    if (action === 'addCredits') {
      data.amount = creditAmount;
    }
    
    onConfirm(data);
  };

  const handleCancel = () => {
    setCreditAmount(0);
    setConfirmText('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            {actionDetails.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {actionDetails.title}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedUsers.length} {selectedUsers.length === 1 ? 'uživatel' : 'uživatelů'} vybráno
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4">
            {actionDetails.description}
          </p>

          {/* Selected Users Preview */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Vybraní uživatelé:</span>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {selectedUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="text-sm text-gray-600">
                  {user.first_name} {user.last_name} ({user.email})
                </div>
              ))}
              {selectedUsers.length > 5 && (
                <div className="text-sm text-gray-500 italic">
                  ... a dalších {selectedUsers.length - 5} uživatelů
                </div>
              )}
            </div>
          </div>

          {/* Credit Amount Input for addCredits action */}
          {action === 'addCredits' && (
            <div className="mb-4">
              <InputField
                label="Počet kreditů k přidání"
                name="creditAmount"
                type="number"
                min="1"
                value={creditAmount.toString()}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                placeholder="Zadejte počet kreditů"
                required
              />
            </div>
          )}

          {/* Confirmation Input for destructive actions */}
          {actionDetails.requiresConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pro potvrzení napište &quot;SMAZAT&quot;:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="SMAZAT"
              />
            </div>
          )}

          {/* Warning for destructive actions */}
          {actionDetails.isDestructive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Varování</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Tato akce je nevratná. Ujistěte se, že opravdu chcete pokračovat.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Zrušit
            </Button>
            <Button
              variant={actionDetails.confirmButtonVariant}
              onClick={handleConfirm}
              disabled={!canConfirm || loading || (action === 'addCredits' && creditAmount <= 0)}
              isLoading={loading}
            >
              {actionDetails.confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionConfirmDialog;
