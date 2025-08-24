import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Badge from '../ui/Badge';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface NotificationData {
  subject: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high';
  send_email: boolean;
  send_in_app: boolean;
  scheduled_for?: string;
}

interface UserNotificationFormProps {
  selectedUsers: Array<{ id: string; name: string; email: string }>;
  onSend: (notification: NotificationData) => Promise<void>;
  templates?: NotificationTemplate[];
  loading?: boolean;
}

const UserNotificationForm: React.FC<UserNotificationFormProps> = ({
  selectedUsers,
  onSend,
  templates = [],
  loading = false
}) => {
  const [notification, setNotification] = useState<NotificationData>({
    subject: '',
    content: '',
    type: 'info',
    priority: 'normal',
    send_email: true,
    send_in_app: true
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultTemplates: NotificationTemplate[] = [
    {
      id: 'welcome',
      name: 'Uvítací zpráva',
      subject: 'Vítejte v EduAI-Asistent',
      content: 'Vážený uživateli,\n\nvítejte v systému EduAI-Asistent. Váš účet byl úspěšně aktivován.\n\nS pozdravem,\nTým EduAI-Asistent',
      type: 'success'
    },
    {
      id: 'credits_low',
      name: 'Nízký zůstatek kreditů',
      subject: 'Nízký zůstatek kreditů',
      content: 'Vážený uživateli,\n\nváš zůstatek kreditů je nízký. Zvažte doplnění kreditů pro pokračování v používání služeb.\n\nS pozdravem,\nTým EduAI-Asistent',
      type: 'warning'
    },
    {
      id: 'maintenance',
      name: 'Plánovaná údržba',
      subject: 'Plánovaná údržba systému',
      content: 'Vážený uživateli,\n\nv neděli od 2:00 do 6:00 proběhne plánovaná údržba systému. Po tuto dobu může být služba nedostupná.\n\nDěkujeme za pochopení,\nTým EduAI-Asistent',
      type: 'info'
    },
    {
      id: 'account_suspended',
      name: 'Pozastavení účtu',
      subject: 'Pozastavení účtu',
      content: 'Vážený uživateli,\n\nváš účet byl dočasně pozastaven. Pro více informací kontaktujte podporu.\n\nS pozdravem,\nTým EduAI-Asistent',
      type: 'error'
    }
  ];

  const allTemplates = [...defaultTemplates, ...templates];

  const handleTemplateSelect = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      setNotification({
        ...notification,
        subject: template.subject,
        content: template.content,
        type: template.type
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleSend = async () => {
    if (!notification.subject.trim() || !notification.content.trim()) {
      return;
    }

    try {
      await onSend(notification);
      // Reset form after successful send
      setNotification({
        subject: '',
        content: '',
        type: 'info',
        priority: 'normal',
        send_email: true,
        send_in_app: true
      });
      setSelectedTemplate('');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'success': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
    };
    return colors[type] || colors.info;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.normal;
  };

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Poslat notifikaci</h3>
          <p className="text-sm text-gray-600">
            {selectedUsers.length} uživatelů vybráno
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={loading}
        >
          {showAdvanced ? 'Skrýt' : 'Rozšířené'} možnosti
        </Button>
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Příjemci:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant="outline" className="text-sm">
                {user.name} ({user.email})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Šablony</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{template.name}</span>
                <Badge className={getTypeColor(template.type)}>
                  {template.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 truncate">{template.subject}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ notifikace
            </label>
            <select
              value={notification.type}
              onChange={(e) => setNotification({
                ...notification,
                type: e.target.value as 'info' | 'warning' | 'success' | 'error'
              })}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Informace</option>
              <option value="warning">Upozornění</option>
              <option value="success">Úspěch</option>
              <option value="error">Chyba</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorita
            </label>
            <select
              value={notification.priority}
              onChange={(e) => setNotification({
                ...notification,
                priority: e.target.value as 'low' | 'normal' | 'high'
              })}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Nízká</option>
              <option value="normal">Normální</option>
              <option value="high">Vysoká</option>
            </select>
          </div>
        </div>

        <InputField
          label="Předmět"
          value={notification.subject}
          onChange={(e) => setNotification({
            ...notification,
            subject: e.target.value
          })}
          placeholder="Zadejte předmět notifikace"
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Obsah zprávy
          </label>
          <textarea
            value={notification.content}
            onChange={(e) => setNotification({
              ...notification,
              content: e.target.value
            })}
            rows={6}
            placeholder="Zadejte obsah notifikace..."
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-md font-medium text-gray-900">Rozšířené možnosti</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notification.send_email}
                    onChange={(e) => setNotification({
                      ...notification,
                      send_email: e.target.checked
                    })}
                    disabled={loading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Poslat email</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notification.send_in_app}
                    onChange={(e) => setNotification({
                      ...notification,
                      send_in_app: e.target.checked
                    })}
                    disabled={loading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Poslat v aplikaci</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naplánovat na
                </label>
                <InputField
                  type="datetime-local"
                  value={notification.scheduled_for || ''}
                  onChange={(e) => setNotification({
                    ...notification,
                    scheduled_for: e.target.value
                  })}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ponechte prázdné pro okamžité odeslání
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {(notification.subject || notification.content) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Náhled:</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(notification.type)}>
                  {notification.type}
                </Badge>
                <Badge className={getPriorityColor(notification.priority)}>
                  {notification.priority}
                </Badge>
              </div>
              {notification.subject && (
                <p className="font-medium text-gray-900">{notification.subject}</p>
              )}
              {notification.content && (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {notification.content}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedUsers.length} příjemců
          </div>
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={loading || !notification.subject.trim() || !notification.content.trim()}
          >
            {loading ? 'Odesílám...' : 'Odeslat notifikaci'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserNotificationForm;
