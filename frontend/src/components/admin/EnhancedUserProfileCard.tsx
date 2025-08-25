import React, { useState } from 'react';
import { 
  User, Mail, Calendar, CreditCard, School, Shield, 
  Edit, Save, X, CheckCircle, XCircle, AlertTriangle,
  Clock, Activity, Phone, MapPin
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Badge from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  is_active: boolean;
  status: string;
  school_id?: string;
  school_name?: string;
  credits_balance: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_activity_at?: string;
  total_logins?: number;
  total_activities?: number;
  total_credits_used?: number;
  total_credits_earned?: number;
  preferences?: any;
  contact_info?: {
    phone?: string;
    address?: string;
  };
}

interface EnhancedUserProfileCardProps {
  user: UserProfile;
  onEdit: () => void;
  onSendNotification: () => void;
  onStatusChange: (status: string) => Promise<void>;
  onResetPassword: () => Promise<void>;
  onQuickEdit: (data: Partial<UserProfile>) => Promise<void>;
  loading?: boolean;
}

const EnhancedUserProfileCard: React.FC<EnhancedUserProfileCardProps> = ({
  user,
  onEdit,
  onSendNotification,
  onStatusChange,
  onResetPassword,
  onQuickEdit,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    credits_balance: user.credits_balance
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleQuickSave = async () => {
    try {
      setSaving(true);
      await onQuickEdit(editData);
      setIsEditing(false);
      showToast({ type: 'success', message: 'Profil byl úspěšně aktualizován' });
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      credits_balance: user.credits_balance
    });
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'platform_admin': 'Platform Admin',
      'school_admin': 'Správce školy',
      'teacher_school': 'Učitel školy',
      'teacher_individual': 'Individuální učitel'
    };
    return roleLabels[role] || role;
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="error">Neaktivní</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="success">Aktivní</Badge>;
      case 'suspended':
        return <Badge variant="warning">Pozastaveno</Badge>;
      case 'pending_verification':
        return <Badge variant="warning">Čeká na ověření</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <InputField
                      label=""
                      name="first_name"
                      value={editData.first_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder-white/70"
                      disabled={saving}
                    />
                    <InputField
                      label=""
                      name="last_name"
                      value={editData.last_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder-white/70"
                      disabled={saving}
                    />
                  </div>
                  <InputField
                    label=""
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder-white/70"
                    disabled={saving}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-1">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-white/80 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </>
              )}
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                  {getRoleLabel(user.role)}
                </Badge>
                {getStatusBadge(user.status, user.is_active)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQuickSave}
                  disabled={saving}
                  isLoading={saving}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Základní informace
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">ID uživatele</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {user.id}
                  </span>
                </div>
                
                {user.school_name && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <School className="w-4 h-4" />
                      Škola
                    </span>
                    <span className="font-medium">{user.school_name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Kredity
                  </span>
                  {isEditing ? (
                    <InputField
                      label=""
                      name="credits_balance"
                      type="number"
                      min="0"
                      value={editData.credits_balance.toString()}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        credits_balance: parseInt(e.target.value) || 0 
                      }))}
                      className="w-24 text-right"
                      disabled={saving}
                    />
                  ) : (
                    <span className="font-bold text-blue-600">{user.credits_balance}</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Oprávnění
                  </span>
                  <span className="font-medium">{getRoleLabel(user.role)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Stats */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Aktivita a statistiky
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Registrace
                  </span>
                  <span className="text-sm">{formatDate(user.created_at)}</span>
                </div>

                {user.last_login_at && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Poslední přihlášení
                    </span>
                    <span className="text-sm">{formatDate(user.last_login_at)}</span>
                  </div>
                )}

                {user.total_logins !== undefined && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Celkem přihlášení</span>
                    <span className="font-medium">{user.total_logins}</span>
                  </div>
                )}

                {user.total_credits_used !== undefined && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Použité kredity</span>
                    <span className="font-medium text-red-600">{user.total_credits_used}</span>
                  </div>
                )}

                {user.total_credits_earned !== undefined && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Získané kredity</span>
                    <span className="font-medium text-green-600">{user.total_credits_earned}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {user.contact_info && (user.contact_info.phone || user.contact_info.address) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              Kontaktní informace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.contact_info.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user.contact_info.phone}</span>
                </div>
              )}
              {user.contact_info.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{user.contact_info.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <Button onClick={onEdit} disabled={loading}>
              <Edit className="w-4 h-4 mr-2" />
              Upravit profil
            </Button>
            <Button variant="outline" onClick={onSendNotification} disabled={loading}>
              <Mail className="w-4 h-4 mr-2" />
              Odeslat oznámení
            </Button>
            <Button variant="outline" onClick={onResetPassword} disabled={loading}>
              <Shield className="w-4 h-4 mr-2" />
              Resetovat heslo
            </Button>
            
            {/* Status Change Buttons */}
            {user.status !== 'active' && user.is_active && (
              <Button 
                variant="outline" 
                onClick={() => onStatusChange('active')}
                disabled={loading}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aktivovat
              </Button>
            )}
            
            {user.status !== 'suspended' && user.is_active && (
              <Button 
                variant="outline" 
                onClick={() => onStatusChange('suspended')}
                disabled={loading}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pozastavit
              </Button>
            )}
            
            {user.is_active && (
              <Button 
                variant="outline" 
                onClick={() => onStatusChange('inactive')}
                disabled={loading}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deaktivovat
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedUserProfileCard;