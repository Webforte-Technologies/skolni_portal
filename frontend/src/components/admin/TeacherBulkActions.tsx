import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, CreditCard, Building2, Trash2, Send, AlertTriangle } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { teacherService, BulkTeacherOperation } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';
import { School } from '../../types';
import { api } from '../../services/apiClient';

interface TeacherBulkActionsProps {
  selectedTeacherIds: string[];
  onSuccess: () => void;
  onClearSelection: () => void;
}

interface BulkActionModalProps {
  isOpen: boolean;
  action: BulkAction | null;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (data: any) => void;
  loading: boolean;
}

type BulkAction = 
  | 'activate' 
  | 'deactivate' 
  | 'addCredits' 
  | 'deductCredits' 
  | 'assignToSchool' 
  | 'removeFromSchool' 
  | 'delete'
  | 'sendNotification';

const BulkActionModal: React.FC<BulkActionModalProps> = ({
  isOpen,
  action,
  selectedCount,
  onClose,
  onConfirm,
  loading
}) => {
  const [formData, setFormData] = useState<any>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  React.useEffect(() => {
    if (action === 'assignToSchool' && isOpen) {
      fetchSchools();
    }
  }, [action, isOpen]);

  const fetchSchools = async () => {
    try {
      setSchoolsLoading(true);
      const response = await api.get<{ data: School[]; total: number }>('/schools?limit=1000');
      setSchools(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const getActionConfig = () => {
    switch (action) {
      case 'activate':
        return {
          title: 'Aktivovat učitele',
          description: `Opravdu chcete aktivovat ${selectedCount} vybraných učitelů?`,
          confirmText: 'Aktivovat',
          confirmVariant: 'primary' as const,
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'deactivate':
        return {
          title: 'Deaktivovat učitele',
          description: `Opravdu chcete deaktivovat ${selectedCount} vybraných učitelů?`,
          confirmText: 'Deaktivovat',
          confirmVariant: 'secondary' as const,
          icon: XCircle,
          iconColor: 'text-gray-600'
        };
      case 'addCredits':
        return {
          title: 'Přidat kredity',
          description: `Přidat kredity ${selectedCount} vybraným učitelům`,
          confirmText: 'Přidat kredity',
          confirmVariant: 'primary' as const,
          icon: CreditCard,
          iconColor: 'text-green-600'
        };
      case 'deductCredits':
        return {
          title: 'Odečíst kredity',
          description: `Odečíst kredity ${selectedCount} vybraným učitelům`,
          confirmText: 'Odečíst kredity',
          confirmVariant: 'secondary' as const,
          icon: CreditCard,
          iconColor: 'text-orange-600'
        };
      case 'assignToSchool':
        return {
          title: 'Přiřadit ke škole',
          description: `Přiřadit ${selectedCount} vybraných učitelů ke škole`,
          confirmText: 'Přiřadit',
          confirmVariant: 'primary' as const,
          icon: Building2,
          iconColor: 'text-blue-600'
        };
      case 'removeFromSchool':
        return {
          title: 'Odebrat ze školy',
          description: `Opravdu chcete odebrat ${selectedCount} vybraných učitelů ze škol?`,
          confirmText: 'Odebrat',
          confirmVariant: 'secondary' as const,
          icon: Building2,
          iconColor: 'text-orange-600'
        };
      case 'sendNotification':
        return {
          title: 'Odeslat oznámení',
          description: `Odeslat oznámení ${selectedCount} vybraným učitelům`,
          confirmText: 'Odeslat',
          confirmVariant: 'primary' as const,
          icon: Send,
          iconColor: 'text-blue-600'
        };
      case 'delete':
        return {
          title: 'Smazat učitele',
          description: `POZOR: Opravdu chcete smazat ${selectedCount} vybraných učitelů? Tato akce je nevratná!`,
          confirmText: 'Smazat',
          confirmVariant: 'danger' as const,
          icon: Trash2,
          iconColor: 'text-red-600'
        };
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  const config = getActionConfig();
  if (!isOpen || !config) return null;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-3 mb-4">
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">{config.description}</p>

            {/* Action-specific form fields */}
            {(action === 'addCredits' || action === 'deductCredits') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Počet kreditů
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Zadejte počet kreditů"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  disabled={loading}
                />
              </div>
            )}

            {action === 'assignToSchool' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte školu
                </label>
                <select
                  value={formData.school_id || ''}
                  onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || schoolsLoading}
                >
                  <option value="">Vyberte školu</option>
                  {schools && schools.length > 0 && schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} {school.city && `(${school.city})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {action === 'sendNotification' && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nadpis oznámení
                  </label>
                  <Input
                    type="text"
                    placeholder="Zadejte nadpis"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zpráva
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Zadejte zprávu"
                    value={formData.message || ''}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorita
                  </label>
                  <select
                    value={formData.priority || 'normal'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="low">Nízká</option>
                    <option value="normal">Normální</option>
                    <option value="high">Vysoká</option>
                  </select>
                </div>
              </div>
            )}

            {action === 'delete' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Varování: Tato akce je nevratná!</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Zrušit
            </Button>
            <Button
              variant={config.confirmVariant}
              onClick={handleConfirm}
              disabled={loading || (
                (action === 'addCredits' || action === 'deductCredits') && !formData.amount
              ) || (
                action === 'assignToSchool' && !formData.school_id
              ) || (
                action === 'sendNotification' && (!formData.title || !formData.message)
              )}
              isLoading={loading}
            >
              {config.confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherBulkActions: React.FC<TeacherBulkActionsProps> = ({
  selectedTeacherIds,
  onSuccess,
  onClearSelection
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkAction | null>(null);

  const handleAction = (action: BulkAction) => {
    setCurrentAction(action);
    setShowModal(true);
    setError(null);
  };

  const handleConfirm = async (formData: any) => {
    if (!currentAction) return;

    try {
      setLoading(true);
      setError(null);

      if (currentAction === 'sendNotification') {
        // Handle bulk notifications separately
        for (const teacherId of selectedTeacherIds) {
          await teacherService.sendNotification(teacherId, {
            title: formData.title,
            message: formData.message,
            priority: formData.priority || 'normal',
            notification_type: 'admin_message'
          });
        }
      } else {
        // Handle other bulk operations
        const operation: BulkTeacherOperation = {
          action: currentAction,
          teacher_ids: selectedTeacherIds,
          ...(formData.amount && { amount: formData.amount }),
          ...(formData.school_id && { school_id: formData.school_id })
        };

        await teacherService.bulkOperation(operation);
      }

      onSuccess();
      onClearSelection();
      setShowModal(false);
      setCurrentAction(null);
    } catch (err) {
      console.error('Bulk operation failed:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      setShowModal(false);
      setCurrentAction(null);
      setError(null);
    }
  };

  if (selectedTeacherIds.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Vybráno {selectedTeacherIds.length} učitelů
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Actions */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('activate')}
              className="text-green-700 hover:text-green-800"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aktivovat
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('deactivate')}
              className="text-gray-700 hover:text-gray-800"
              disabled={loading}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Deaktivovat
            </Button>

            {/* Credit Actions */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('addCredits')}
              className="text-green-700 hover:text-green-800"
              disabled={loading}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              + Kredity
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('deductCredits')}
              className="text-orange-700 hover:text-orange-800"
              disabled={loading}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              - Kredity
            </Button>

            {/* School Actions */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('assignToSchool')}
              className="text-blue-700 hover:text-blue-800"
              disabled={loading}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Přiřadit školu
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('removeFromSchool')}
              className="text-orange-700 hover:text-orange-800"
              disabled={loading}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Odebrat školu
            </Button>

            {/* Notification Action */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction('sendNotification')}
              className="text-blue-700 hover:text-blue-800"
              disabled={loading}
            >
              <Send className="w-4 h-4 mr-1" />
              Oznámení
            </Button>

            {/* Delete Action */}
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleAction('delete')}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Smazat
            </Button>

            {/* Clear Selection */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              disabled={loading}
            >
              Zrušit výběr
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}
      </Card>

      <BulkActionModal
        isOpen={showModal}
        action={currentAction}
        selectedCount={selectedTeacherIds.length}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
};

export default TeacherBulkActions;
