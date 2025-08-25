import React, { useState, useEffect } from 'react';
import { 
  Send, Bell, Clock, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle,
  MessageSquare, Target
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui';
import { teacherService, Teacher } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'reminder' | 'announcement' | 'warning' | 'custom';
  variables: string[];
  created_at: string;
  updated_at: string;
  usage_count: number;
}

interface NotificationCampaign {
  id: string;
  name: string;
  template_id: string;
  template_name: string;
  target_criteria: {
    roles?: string[];
    statuses?: string[];
    school_ids?: string[];
    credit_range?: { min: number; max: number };
    activity_range?: { start: string; end: string };
    custom_filter?: string;
  };
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  recipients_count: number;
  sent_count: number;
  delivery_stats: {
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  created_by: string;
  created_at: string;
}

interface NotificationHistory {
  id: string;
  campaign_id?: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  subject: string;
  content: string;
  type: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
}

interface TeacherNotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeacherNotificationSystem: React.FC<TeacherNotificationSystemProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'campaigns' | 'history'>('compose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compose notification state
  const [composeForm, setComposeForm] = useState({
    subject: '',
    content: '',
    type: 'custom' as const,
    priority: 'normal' as 'low' | 'normal' | 'high',
    schedule_type: 'now' as 'now' | 'scheduled',
    scheduled_at: '',
    target_type: 'all' as 'all' | 'selected' | 'filtered',
    selected_teachers: [] as string[],
    filter_criteria: {
      roles: [] as string[],
      statuses: [] as string[],
      school_ids: [] as string[],
      credit_range: { min: 0, max: 10000 },
      activity_days: 30
    }
  });

  // Templates state
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [campaignFilter, setCampaignFilter] = useState('all');

  // History state
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [historyFilter, setHistoryFilter] = useState({
    status: 'all',
    type: 'all',
    date_range: '7d'
  });

  // Teachers for targeting
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchCampaigns();
      fetchHistory();
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Vítací zpráva',
          subject: 'Vítejte v EduAI-Asistent!',
          content: 'Vážený/á {{teacher_name}}, vítáme Vás v naší platformě. Vaše škola: {{school_name}}.',
          type: 'welcome',
          variables: ['teacher_name', 'school_name', 'credits_balance'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 45
        },
        {
          id: '2',
          name: 'Připomínka kreditů',
          subject: 'Málo kreditů - doplňte si zůstatek',
          content: 'Vážený/á {{teacher_name}}, zbývá Vám pouze {{credits_balance}} kreditů.',
          type: 'reminder',
          variables: ['teacher_name', 'credits_balance'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 23
        }
      ];
      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockCampaigns: NotificationCampaign[] = [
        {
          id: '1',
          name: 'Měsíční newsletter',
          template_id: '1',
          template_name: 'Vítací zpráva',
          target_criteria: { roles: ['teacher_school'] },
          status: 'sent',
          recipients_count: 234,
          sent_count: 234,
          delivery_stats: {
            delivered: 230,
            failed: 4,
            opened: 156,
            clicked: 89
          },
          created_by: 'admin',
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        }
      ];
      setCampaigns(mockCampaigns);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockHistory: NotificationHistory[] = [
        {
          id: '1',
          campaign_id: '1',
          teacher_id: '1',
          teacher_name: 'Jan Novák',
          teacher_email: 'jan.novak@skola.cz',
          subject: 'Vítejte v EduAI-Asistent!',
          content: 'Vážený Jene Nováku, vítáme Vás...',
          type: 'welcome',
          status: 'delivered',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          opened_at: new Date().toISOString()
        }
      ];
      setHistory(mockHistory);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getTeachers({ limit: 1000, offset: 0 });
      setAvailableTeachers(response.data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetTeachers: string[] = [];

      if (composeForm.target_type === 'all') {
        targetTeachers = availableTeachers.map(t => t.id);
      } else if (composeForm.target_type === 'selected') {
        targetTeachers = composeForm.selected_teachers;
      } else {
        // Apply filters to get target teachers
        targetTeachers = availableTeachers
          .filter(teacher => {
            if (composeForm.filter_criteria.roles.length > 0 && 
                !composeForm.filter_criteria.roles.includes(teacher.role)) {
              return false;
            }
            if (composeForm.filter_criteria.statuses.length > 0 && 
                !composeForm.filter_criteria.statuses.includes(teacher.status)) {
              return false;
            }
            if (composeForm.filter_criteria.school_ids.length > 0 && 
                teacher.school_id && 
                !composeForm.filter_criteria.school_ids.includes(teacher.school_id)) {
              return false;
            }
            if (teacher.credits_balance < composeForm.filter_criteria.credit_range.min ||
                teacher.credits_balance > composeForm.filter_criteria.credit_range.max) {
              return false;
            }
            return true;
          })
          .map(t => t.id);
      }

      if (composeForm.schedule_type === 'now') {
        // Send immediately to all target teachers
        for (const teacherId of targetTeachers) {
          await teacherService.sendNotification(teacherId, {
            title: composeForm.subject,
            message: composeForm.content,
            priority: composeForm.priority,
            notification_type: composeForm.type
          });
        }
      } else {
        // Schedule for later (would need backend support)
        console.log('Scheduling notification for:', composeForm.scheduled_at);
      }

      // Reset form
      setComposeForm({
        subject: '',
        content: '',
        type: 'custom',
        priority: 'normal',
        schedule_type: 'now',
        scheduled_at: '',
        target_type: 'all',
        selected_teachers: [],
        filter_criteria: {
          roles: [],
          statuses: [],
          school_ids: [],
          credit_range: { min: 0, max: 10000 },
          activity_days: 30
        }
      });

      // Refresh data
      await fetchCampaigns();
      await fetchHistory();

    } catch (err) {
      console.error('Failed to send notification:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <CheckCircle className="w-4 h-4" />;
      case 'reminder':
        return <Clock className="w-4 h-4" />;
      case 'announcement':
        return <Bell className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Systém oznámení</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'compose', label: 'Napsat oznámení', icon: Send },
                { id: 'templates', label: 'Šablony', icon: Edit },
                { id: 'campaigns', label: 'Kampaně', icon: Target },
                { id: 'history', label: 'Historie', icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Compose Tab */}
            {activeTab === 'compose' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Compose Form */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nové oznámení</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Předmět
                        </label>
                        <Input
                          type="text"
                          value={composeForm.subject}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Zadejte předmět oznámení"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Obsah
                        </label>
                        <textarea
                          rows={6}
                          value={composeForm.content}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Zadejte obsah oznámení..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Typ
                          </label>
                          <select
                            value={composeForm.type}
                            onChange={(e) => setComposeForm(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="custom">Vlastní</option>
                            <option value="welcome">Vítací</option>
                            <option value="reminder">Připomínka</option>
                            <option value="announcement">Oznámení</option>
                            <option value="warning">Varování</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priorita
                          </label>
                          <select
                            value={composeForm.priority}
                            onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="low">Nízká</option>
                            <option value="normal">Normální</option>
                            <option value="high">Vysoká</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plánování
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="schedule_type"
                              value="now"
                              checked={composeForm.schedule_type === 'now'}
                              onChange={(e) => setComposeForm(prev => ({ ...prev, schedule_type: e.target.value as any }))}
                              className="mr-2"
                            />
                            Odeslat nyní
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="schedule_type"
                              value="scheduled"
                              checked={composeForm.schedule_type === 'scheduled'}
                              onChange={(e) => setComposeForm(prev => ({ ...prev, schedule_type: e.target.value as any }))}
                              className="mr-2"
                            />
                            Naplánovat
                          </label>
                        </div>
                        
                        {composeForm.schedule_type === 'scheduled' && (
                          <div className="mt-2">
                            <Input
                              type="datetime-local"
                              value={composeForm.scheduled_at}
                              onChange={(e) => setComposeForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Target Selection */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cílová skupina</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Typ cílení
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="target_type"
                              value="all"
                              checked={composeForm.target_type === 'all'}
                              onChange={(e) => setComposeForm(prev => ({ ...prev, target_type: e.target.value as any }))}
                              className="mr-2"
                            />
                            Všichni učitelé ({availableTeachers.length})
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="target_type"
                              value="filtered"
                              checked={composeForm.target_type === 'filtered'}
                              onChange={(e) => setComposeForm(prev => ({ ...prev, target_type: e.target.value as any }))}
                              className="mr-2"
                            />
                            Podle kritérií
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="target_type"
                              value="selected"
                              checked={composeForm.target_type === 'selected'}
                              onChange={(e) => setComposeForm(prev => ({ ...prev, target_type: e.target.value as any }))}
                              className="mr-2"
                            />
                            Vybraní učitelé
                          </label>
                        </div>
                      </div>

                      {composeForm.target_type === 'filtered' && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <div className="space-y-1">
                              {['teacher_school', 'teacher_individual'].map(role => (
                                <label key={role} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={composeForm.filter_criteria.roles.includes(role)}
                                    onChange={(e) => {
                                      const roles = e.target.checked
                                        ? [...composeForm.filter_criteria.roles, role]
                                        : composeForm.filter_criteria.roles.filter(r => r !== role);
                                      setComposeForm(prev => ({
                                        ...prev,
                                        filter_criteria: { ...prev.filter_criteria, roles }
                                      }));
                                    }}
                                    className="mr-2"
                                  />
                                  {role === 'teacher_school' ? 'Školní učitel' : 'Individuální učitel'}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stavy
                            </label>
                            <div className="space-y-1">
                              {['active', 'inactive', 'pending_verification', 'suspended'].map(status => (
                                <label key={status} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={composeForm.filter_criteria.statuses.includes(status)}
                                    onChange={(e) => {
                                      const statuses = e.target.checked
                                        ? [...composeForm.filter_criteria.statuses, status]
                                        : composeForm.filter_criteria.statuses.filter(s => s !== status);
                                      setComposeForm(prev => ({
                                        ...prev,
                                        filter_criteria: { ...prev.filter_criteria, statuses }
                                      }));
                                    }}
                                    className="mr-2"
                                  />
                                  {status === 'active' ? 'Aktivní' :
                                   status === 'inactive' ? 'Neaktivní' :
                                   status === 'pending_verification' ? 'Čekající' : 'Pozastavený'}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleSendNotification}
                          disabled={loading || !composeForm.subject || !composeForm.content}
                          isLoading={loading}
                          className="w-full"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {composeForm.schedule_type === 'now' ? 'Odeslat oznámení' : 'Naplánovat oznámení'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Šablony oznámení</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Nová šablona
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(template.type)}
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.usage_count} použití
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Předmět:</div>
                          <div className="text-sm text-gray-600">{template.subject}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Obsah:</div>
                          <div className="text-sm text-gray-600 line-clamp-2">{template.content}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {template.variables.length} proměnných
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Kampaně</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={campaignFilter}
                      onChange={(e) => setCampaignFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                    >
                      <option value="all">Všechny kampaně</option>
                      <option value="sent">Odeslané</option>
                      <option value="scheduled">Naplánované</option>
                      <option value="draft">Koncepty</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <Card key={campaign.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                            <Badge variant="outline" className={getStatusColor(campaign.status)}>
                              {campaign.status === 'sent' ? 'Odesláno' :
                               campaign.status === 'scheduled' ? 'Naplánováno' :
                               campaign.status === 'sending' ? 'Odesílá se' :
                               campaign.status === 'draft' ? 'Koncept' : 'Chyba'}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            Šablona: {campaign.template_name}
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>Příjemci: {campaign.recipients_count}</span>
                            {campaign.status === 'sent' && (
                              <>
                                <span>Doručeno: {campaign.delivery_stats.delivered}</span>
                                <span>Otevřeno: {campaign.delivery_stats.opened}</span>
                                <span>Kliknuto: {campaign.delivery_stats.clicked}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {campaign.status === 'draft' && (
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Historie oznámení</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={historyFilter.status}
                      onChange={(e) => setHistoryFilter(prev => ({ ...prev, status: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                    >
                      <option value="all">Všechny stavy</option>
                      <option value="delivered">Doručeno</option>
                      <option value="failed">Chyba</option>
                      <option value="opened">Otevřeno</option>
                    </select>
                    <select
                      value={historyFilter.date_range}
                      onChange={(e) => setHistoryFilter(prev => ({ ...prev, date_range: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                    >
                      <option value="7d">Posledních 7 dní</option>
                      <option value="30d">Posledních 30 dní</option>
                      <option value="90d">Posledních 90 dní</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Příjemce
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Předmět
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Typ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Stav
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Odesláno
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map(item => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.teacher_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.teacher_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(item.type)}
                              <span className="text-sm text-gray-900 capitalize">
                                {item.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status === 'delivered' ? 'Doručeno' :
                               item.status === 'sent' ? 'Odesláno' :
                               item.status === 'failed' ? 'Chyba' :
                               item.status === 'opened' ? 'Otevřeno' :
                               item.status === 'clicked' ? 'Kliknuto' : 'Čeká'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.sent_at).toLocaleDateString('cs-CZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNotificationSystem;
