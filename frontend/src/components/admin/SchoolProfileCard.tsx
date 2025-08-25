import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Users, 
  CreditCard, 
  Calendar,
  Shield,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export interface SchoolProfileData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  status: string;
  subscription_tier: string;
  max_teachers: number;
  max_students: number;
  verification_required: boolean;
  last_activity_at?: string;
  admin_activity_at?: string;
  created_at: string;
  teacher_count: number;
  admin_count: number;
  active_users: number;
  total_credits: number;
}

export interface SchoolProfileCardProps {
  school: SchoolProfileData;
  onEdit?: () => void;
  onStatusChange?: () => void;
  onSendNotification?: () => void;
}

export const SchoolProfileCard: React.FC<SchoolProfileCardProps> = ({
  school,
  onEdit,
  onStatusChange,
  onSendNotification
}) => {
  const getStatusInfo = (status: string) => {
    const statusConfig = {
      'active': { label: 'Aktivní', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'suspended': { label: 'Pozastavené', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      'pending_verification': { label: 'Čekající na ověření', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'inactive': { label: 'Neaktivní', color: 'bg-gray-100 text-gray-800', icon: Clock }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  };

  const getSubscriptionTierInfo = (tier: string) => {
    const tierConfig = {
      'basic': { label: 'Základní', color: 'bg-blue-100 text-blue-800', icon: Shield },
      'premium': { label: 'Premium', color: 'bg-purple-100 text-purple-800', icon: Crown },
      'enterprise': { label: 'Enterprise', color: 'bg-indigo-100 text-indigo-800', icon: Crown }
    };
    
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Méně než hodinu';
    if (diffInHours < 24) return `Před ${diffInHours} hodinami`;
    if (diffInHours < 48) return 'Včera';
    return formatDate(dateString);
  };

  const statusInfo = getStatusInfo(school.status);
  const tierInfo = getSubscriptionTierInfo(school.subscription_tier);
  const StatusIcon = statusInfo.icon;
  const TierIcon = tierInfo.icon;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {school.logo_url ? (
            <img 
              src={school.logo_url} 
              alt={`Logo ${school.name}`}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{school.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusInfo.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Badge className={tierInfo.color}>
                <TierIcon className="h-3 w-3 mr-1" />
                {tierInfo.label}
              </Badge>
              {school.verification_required && (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Ověření vyžadováno
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Upravit
            </Button>
          )}
          {onStatusChange && (
            <Button variant="outline" size="sm" onClick={onStatusChange}>
              Změnit stav
            </Button>
          )}
          {onSendNotification && (
            <Button variant="outline" size="sm" onClick={onSendNotification}>
              Odeslat notifikaci
            </Button>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Kontaktní informace</h3>
          {school.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{school.address}</span>
            </div>
          )}
          {school.city && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{school.city}, {school.postal_code} {school.country}</span>
            </div>
          )}
          {school.contact_email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{school.contact_email}</span>
            </div>
          )}
          {school.contact_phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{school.contact_phone}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Statistiky</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Učitelé</span>
              </div>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {school.teacher_count} / {school.max_teachers}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Admini</span>
              </div>
              <p className="text-xl font-bold text-green-900 mt-1">{school.admin_count}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Aktivní</span>
              </div>
              <p className="text-xl font-bold text-purple-900 mt-1">{school.active_users}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Kredity</span>
              </div>
              <p className="text-xl font-bold text-orange-900 mt-1">{school.total_credits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Vytvořeno</span>
          </div>
          <p className="text-sm text-gray-900">{formatDate(school.created_at)}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Poslední aktivita</span>
          </div>
          <p className="text-sm text-gray-900">
            {school.last_activity_at ? getRelativeTime(school.last_activity_at) : 'Žádná aktivita'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Admin aktivita</span>
          </div>
          <p className="text-sm text-gray-900">
            {school.admin_activity_at ? getRelativeTime(school.admin_activity_at) : 'Žádná aktivita'}
          </p>
        </div>
      </div>

      {/* Limits and Quotas */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Limity a kvóty</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Maximální počet učitelů</span>
              <span className="font-medium">{school.max_teachers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(school.teacher_count / school.max_teachers) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Maximální počet studentů</span>
              <span className="font-medium">{school.max_students}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(school.active_users / school.max_students) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
