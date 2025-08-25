import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Wrench, 
  RefreshCw,
  Send,
  X
} from 'lucide-react';

export interface SchoolNotificationFormData {
  title: string;
  message: string;
  notification_type: 'general' | 'announcement' | 'warning' | 'maintenance' | 'update';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  schoolId?: string;
}

export interface SchoolNotificationFormProps {
  schoolId?: string;
  schoolName?: string;
  onSend: (data: SchoolNotificationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SchoolNotificationForm: React.FC<SchoolNotificationFormProps> = ({
  schoolId,
  schoolName,
  onSend,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<SchoolNotificationFormData>({
    title: '',
    message: '',
    notification_type: 'general',
    priority: 'normal'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const notificationTypes = [
    { value: 'general', label: 'Obecné', icon: Info, color: 'bg-blue-100 text-blue-800' },
    { value: 'announcement', label: 'Oznámení', icon: Bell, color: 'bg-green-100 text-green-800' },
    { value: 'warning', label: 'Varování', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'maintenance', label: 'Údržba', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
    { value: 'update', label: 'Aktualizace', icon: RefreshCw, color: 'bg-purple-100 text-purple-800' }
  ];

  const priorities = [
    { value: 'low', label: 'Nízká', color: 'bg-gray-100 text-gray-800' },
    { value: 'normal', label: 'Normální', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'Vysoká', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Naléhavá', color: 'bg-red-100 text-red-800' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Nadpis je povinný';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Zpráva je povinná';
    }

    if (formData.title.length > 255) {
      newErrors.title = 'Nadpis je příliš dlouhý (max 255 znaků)';
    }

    if (formData.message.length > 1000) {
      newErrors.message = 'Zpráva je příliš dlouhá (max 1000 znaků)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Include schoolId in the notification data if available
      const notificationData = schoolId 
        ? { ...formData, schoolId }
        : formData;
      onSend(notificationData);
    }
  };

  const handleInputChange = (field: keyof SchoolNotificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Info;
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Odeslat notifikaci</h2>
            {schoolName && (
              <p className="text-sm text-gray-600">Škola: {schoolName}</p>
            )}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Type and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ notifikace
            </label>
            <Select
              value={formData.notification_type}
              onValueChange={(value) => handleInputChange('notification_type', value)}
            >
              {notificationTypes.map(type => {
                const Icon = type.icon;
                return (
                  <option key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </option>
                );
              })}
            </Select>
            <div className="mt-2">
              <Badge className={getTypeIcon(formData.notification_type) ? 'bg-blue-100 text-blue-800' : ''}>
                {notificationTypes.find(t => t.value === formData.notification_type)?.label}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorita
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
            <div className="mt-2">
              <Badge className={getPriorityColor(formData.priority)}>
                {priorities.find(p => p.value === formData.priority)?.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nadpis <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Zadejte nadpis notifikace..."
            className={errors.title ? 'border-red-300' : ''}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.title.length}/255 znaků
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zpráva <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Zadejte zprávu notifikace..."
            rows={4}
            className={errors.message ? 'border-red-300' : ''}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.message.length}/1000 znaků
          </p>
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platnost do (volitelné)
          </label>
          <Input
            type="datetime-local"
            value={formData.expires_at || ''}
            onChange={(e) => handleInputChange('expires_at', e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Pokud není nastaveno, notifikace nevyprší
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Náhled notifikace</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getTypeIcon(formData.notification_type) ? 'bg-blue-100 text-blue-800' : ''}>
                {notificationTypes.find(t => t.value === formData.notification_type)?.label}
              </Badge>
              <Badge className={getPriorityColor(formData.priority)}>
                {priorities.find(p => p.value === formData.priority)?.label}
              </Badge>
            </div>
            <h5 className="font-medium text-gray-900">
              {formData.title || 'Nadpis notifikace'}
            </h5>
            <p className="text-sm text-gray-600">
              {formData.message || 'Zpráva notifikace...'}
            </p>
            {formData.expires_at && (
              <p className="text-xs text-gray-500">
                Platnost do: {new Date(formData.expires_at).toLocaleString('cs-CZ')}
              </p>
            )}
          </div>
        </div>

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
                Odesílání...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Odeslat
              </div>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
