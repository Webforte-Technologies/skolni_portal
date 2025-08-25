import React, { useState } from 'react';
import { User, School } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import InputField from '../ui/InputField';

export interface UserProfileStats {
  total_sessions: number;
  total_credits_used: number;
  total_credits_purchased: number;
  average_session_duration: number;
  last_login: string;
  account_age_days: number;
  most_used_feature: string;
  activity_score: number;
}

interface UserProfileCardProps {
  user: User;
  school?: School;
  stats?: UserProfileStats;
  onEdit: () => void;
  onSendNotification: () => void;
  onResetPassword: () => void;
  onStatusChange: (status: string) => void;
  loading?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  school,
  stats,
  onEdit,
  onSendNotification,
  onResetPassword,
  onStatusChange,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    credits_balance: user.credits_balance
  });

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'platform_admin': 'Platform Admin',
      'school_admin': 'School Admin',
      'teacher_school': 'School Teacher',
      'teacher_individual': 'Individual Teacher'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'platform_admin': 'bg-red-100 text-red-800',
      'school_admin': 'bg-blue-100 text-blue-800',
      'teacher_school': 'bg-green-100 text-green-800',
      'teacher_individual': 'bg-purple-100 text-purple-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Aktivní' : 'Neaktivní';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getActivityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = () => {
    // Here you would typically call an API to update the user
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      credits_balance: user.credits_balance
    });
    setIsEditing(false);
  };

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getRoleColor(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <Badge className={getStatusColor(user.is_active)}>
                {getStatusLabel(user.is_active)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? 'Zrušit' : 'Upravit'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
            disabled={loading}
          >
            Detailní úprava
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Základní informace</h3>
          
          {isEditing ? (
            <div className="space-y-3">
              <InputField
                label="Jméno"
                name="first_name"
                value={editData.first_name}
                onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                disabled={loading}
              />
              <InputField
                label="Příjmení"
                name="last_name"
                value={editData.last_name}
                onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                disabled={loading}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
                disabled={loading}
              />
              <InputField
                label="Kredity"
                name="credits_balance"
                type="number"
                value={editData.credits_balance.toString()}
                onChange={(e) => setEditData({...editData, credits_balance: parseInt(e.target.value) || 0})}
                disabled={loading}
              />
              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Uložit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Jméno:</span>
                <p className="text-gray-900">{user.first_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Příjmení:</span>
                <p className="text-gray-900">{user.last_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Kredity:</span>
                <p className="text-gray-900 font-semibold">{user.credits_balance}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Registrován:</span>
                <p className="text-gray-900">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Poslední aktualizace:</span>
                <p className="text-gray-900">{formatDate(user.updated_at)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Škola a role</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <p className="text-gray-900">{getRoleLabel(user.role)}</p>
            </div>
            {school && (
              <div>
                <span className="text-sm font-medium text-gray-500">Škola:</span>
                <p className="text-gray-900">{school.name}</p>
                {school.address && (
                  <p className="text-sm text-gray-600">{school.address}</p>
                )}
              </div>
            )}
            {!school && user.role === 'teacher_individual' && (
              <div>
                <span className="text-sm font-medium text-gray-500">Typ účtu:</span>
                <p className="text-gray-900">Individuální učitel</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-md font-medium text-gray-900">Rychlé akce</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onSendNotification}
                disabled={loading}
              >
                Poslat notifikaci
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onResetPassword}
                disabled={loading}
              >
                Resetovat heslo
              </Button>
              <select
                value={user.is_active ? 'active' : 'inactive'}
                onChange={(e) => onStatusChange(e.target.value)}
                disabled={loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Aktivní</option>
                <option value="inactive">Neaktivní</option>
                <option value="suspended">Pozastaveno</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {stats && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiky použití</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Celkem relací</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_sessions}</p>
                </div>
                <div className="text-blue-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Použité kredity</p>
                  <p className="text-2xl font-bold text-green-900">{stats.total_credits_used}</p>
                </div>
                <div className="text-green-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Průměrná relace</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatDuration(stats.average_session_duration)}
                  </p>
                </div>
                <div className="text-yellow-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Aktivita</p>
                  <p className={`text-2xl font-bold ${getActivityScoreColor(stats.activity_score)}`}>
                    {stats.activity_score}%
                  </p>
                </div>
                <div className="text-purple-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Additional stats */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Poslední přihlášení:</span>
              <p className="text-gray-900">{formatDate(stats.last_login)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Věk účtu:</span>
              <p className="text-gray-900">{stats.account_age_days} dní</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Nejpoužívanější funkce:</span>
              <p className="text-gray-900">{stats.most_used_feature}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserProfileCard;
