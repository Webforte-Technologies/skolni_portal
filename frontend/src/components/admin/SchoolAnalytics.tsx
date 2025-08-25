import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  MapPin,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Crown
} from 'lucide-react';

export interface SchoolAnalyticsData {
  total_schools: number;
  active_schools: number;
  suspended_schools: number;
  pending_verification_schools: number;
  schools_by_tier: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  schools_by_city: Array<{
    city: string;
    count: number;
  }>;
  average_teachers_per_school: number;
  average_credits_per_school: number;
  activity_trends: Array<{
    date: string;
    active_schools: number;
    total_activity: number;
  }>;
}

export interface SchoolAnalyticsProps {
  data: SchoolAnalyticsData;
  isLoading?: boolean;
}

export const SchoolAnalytics: React.FC<SchoolAnalyticsProps> = ({ data, isLoading = false }) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getStatusPercentage = (count: number, total: number): number => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return Shield;
      case 'premium': return Crown;
      case 'enterprise': return Crown;
      default: return Shield;
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem škol</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_schools)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Aktivní školy</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.active_schools)}</p>
              <p className="text-sm text-gray-500">
                {getStatusPercentage(data.active_schools, data.total_schools)}% z celku
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Čekající na ověření</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.pending_verification_schools)}</p>
              <p className="text-sm text-gray-500">
                {getStatusPercentage(data.pending_verification_schools, data.total_schools)}% z celku
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pozastavené</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.suspended_schools)}</p>
              <p className="text-sm text-gray-500">
                {getStatusPercentage(data.suspended_schools, data.total_schools)}% z celku
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Tiers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rozdělení podle předplatného</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data.schools_by_tier).map(([tier, count]) => {
            const Icon = getTierIcon(tier);
            const percentage = getStatusPercentage(count, data.total_schools);
            
            return (
              <div key={tier} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={getTierColor(tier)}>
                    <Icon className="h-3 w-3 mr-1" />
                    {tier === 'basic' ? 'Základní' : tier === 'premium' ? 'Premium' : 'Enterprise'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(count)}</p>
                <p className="text-sm text-gray-500">{percentage}% z celku</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Averages and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Průměrné hodnoty</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Průměr učitelů na školu</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(Math.round(data.average_teachers_per_school))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Průměr kreditů na školu</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(Math.round(data.average_credits_per_school))}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nejaktivnější města</h3>
          <div className="space-y-3">
            {data.schools_by_city.slice(0, 5).map((city) => (
              <div key={city.city} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{city.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{city.count} škol</span>
                  <Badge variant="outline" className="text-xs">
                    {getStatusPercentage(city.count, data.total_schools)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Trends */}
      {data.activity_trends.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trendy aktivity (posledních 30 dní)</h3>
          <div className="space-y-4">
            {data.activity_trends.slice(0, 7).map((trend) => (
              <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatDate(trend.date)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Aktivní školy</p>
                    <p className="text-lg font-semibold text-blue-600">{trend.active_schools}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Celkem aktivit</p>
                    <p className="text-lg font-semibold text-green-600">{trend.total_activity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Celkový přehled</h3>
          <p className="text-gray-600 mb-4">
            Platforma aktuálně spravuje {formatNumber(data.total_schools)} škol s celkem{' '}
            {formatNumber(data.active_schools)} aktivními institucemi
          </p>
          <div className="flex items-center justify-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {data.active_schools > 0 ? 'Rostoucí' : 'Stabilní'} aktivita škol
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SchoolAnalytics;
