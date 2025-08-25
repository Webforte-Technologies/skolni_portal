import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Save,
  X
} from 'lucide-react';

export interface SchoolStatusData {
  currentStatus: string;
  schoolName: string;
}

export interface SchoolStatusChangeData {
  newStatus: string;
  reason: string;
}

export interface SchoolStatusManagerProps {
  school: SchoolStatusData;
  onStatusChange: (data: SchoolStatusChangeData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SchoolStatusManager: React.FC<SchoolStatusManagerProps> = ({
  school,
  onStatusChange,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<SchoolStatusChangeData>({
    newStatus: '',
    reason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions = [
    { 
      value: 'active', 
      label: 'Aktivní', 
      icon: CheckCircle, 
      color: 'bg-green-100 text-green-800',
      description: 'Škola je plně funkční a může používat všechny služby'
    },
    { 
      value: 'suspended', 
      label: 'Pozastavené', 
      icon: AlertTriangle, 
      color: 'bg-red-100 text-red-800',
      description: 'Škola je dočasně pozastavena, uživatelé nemohou přistupovat k službám'
    },
    { 
      value: 'pending_verification', 
      label: 'Čekající na ověření', 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Škola čeká na ověření dokumentů nebo informací'
    },
    { 
      value: 'inactive', 
      label: 'Neaktivní', 
      icon: XCircle, 
      color: 'bg-gray-100 text-gray-800',
      description: 'Škola je neaktivní, ale data jsou zachována'
    }
  ];

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status);
  };

  const getValidTransitions = (currentStatus: string): string[] => {
    // Status transition rules - should match backend validation
    const transitions: Record<string, string[]> = {
      'active': ['suspended', 'inactive', 'pending_verification'],
      'suspended': ['active', 'inactive'],
      'pending_verification': ['active', 'inactive'],
      'inactive': ['active', 'pending_verification']
    };
    
    return transitions[currentStatus] || [];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newStatus) {
      newErrors.newStatus = 'Nový stav je povinný';
    } else if (!getValidTransitions(school.currentStatus).includes(formData.newStatus)) {
      newErrors.newStatus = 'Neplatný přechod stavu';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Důvod změny je povinný';
    }

    if (formData.reason.length > 500) {
      newErrors.reason = 'Důvod je příliš dlouhý (max 500 znaků)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onStatusChange(formData);
    }
  };

  const handleInputChange = (field: keyof SchoolStatusChangeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const currentStatusInfo = getStatusInfo(school.currentStatus);
  const validTransitions = getValidTransitions(school.currentStatus);

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Změnit stav školy</h2>
            <p className="text-sm text-gray-600">{school.schoolName}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Aktuální stav</h3>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {currentStatusInfo && (
            <>
              <Badge className={currentStatusInfo.color}>
                <currentStatusInfo.icon className="h-3 w-3 mr-1" />
                {currentStatusInfo.label}
              </Badge>
              <span className="text-sm text-gray-600">{currentStatusInfo.description}</span>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nový stav <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.newStatus}
            onValueChange={(value) => handleInputChange('newStatus', value)}
            className={errors.newStatus ? 'border-red-300' : ''}
          >
            <option value="">Vyberte nový stav</option>
            {validTransitions.map(statusValue => {
              const statusInfo = getStatusInfo(statusValue);
              if (!statusInfo) return null;
              
              return (
                <option key={statusValue} value={statusValue}>
                  {statusInfo.label}
                </option>
              );
            })}
          </Select>
          {errors.newStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.newStatus}</p>
          )}
          
          {/* Status Options Info */}
          <div className="mt-3 space-y-2">
            {validTransitions.map(statusValue => {
              const statusInfo = getStatusInfo(statusValue);
              if (!statusInfo) return null;
              
              const isSelected = formData.newStatus === statusValue;
              
              return (
                <div 
                  key={statusValue}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('newStatus', statusValue)}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={statusInfo.color}>
                      <statusInfo.icon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <span className="text-sm text-gray-600">{statusInfo.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reason for Change */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Důvod změny <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Zadejte důvod změny stavu školy..."
            rows={3}
            className={errors.reason ? 'border-red-300' : ''}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.reason.length}/500 znaků
          </p>
        </div>

        {/* Status Change Preview */}
        {formData.newStatus && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Náhled změny</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Změna z:</span>
                <Badge className={currentStatusInfo?.color || ''}>
                  {currentStatusInfo?.label}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className={getStatusInfo(formData.newStatus)?.color || ''}>
                  {getStatusInfo(formData.newStatus)?.label}
                </Badge>
              </div>
              {formData.reason && (
                <div>
                  <span className="text-sm text-gray-600">Důvod: </span>
                  <span className="text-sm text-gray-900">{formData.reason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Zrušit
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ukládání...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Změnit stav
              </div>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
