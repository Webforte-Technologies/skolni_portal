import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Users, CreditCard, Settings, FileText, Shield, 
  Code, Home, ChevronDown, ChevronRight, Building2, UserCheck,
  DollarSign, TrendingUp, Server, Activity, FileCheck, Lock,
  Flag, Database, TestTube, BookOpen, Zap
} from 'lucide-react';

interface AdminSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: AdminSection[];
}

interface AdminSidebarProps {
  collapsed: boolean;
  currentPath: string;
}

const adminSections: AdminSection[] = [
  {
    id: 'mission-control',
    title: 'Mission Control',
    icon: <Home className="w-5 h-5" />,
    path: '/admin/dashboard'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: <TrendingUp className="w-5 h-5" />,
    children: [
      { id: 'analytics-main', title: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/analytics' },
      { id: 'advanced-analytics', title: 'Advanced Analytics', icon: <Zap className="w-4 h-4" />, path: '/admin/advanced-analytics' },
      { id: 'dynamic-widgets', title: 'Dynamic Widgets Demo', icon: <Activity className="w-4 h-4" />, path: '/admin/dynamic-widgets-demo' }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <FileCheck className="w-5 h-5" />,
    path: '/admin/notifications'
  },
  {
    id: 'user-management',
    title: 'User Management',
    icon: <Users className="w-5 h-5" />,
    children: [
      { id: 'users', title: 'Users', icon: <Users className="w-4 h-4" />, path: '/admin/users' },
      { id: 'schools', title: 'Schools', icon: <Building2 className="w-4 h-4" />, path: '/admin/schools' },
      { id: 'teachers', title: 'Teachers', icon: <UserCheck className="w-4 h-4" />, path: '/admin/teachers' },
      { id: 'roles', title: 'Roles & Permissions', icon: <Shield className="w-4 h-4" />, path: '/admin/roles' }
    ]
  },
  {
    id: 'business-finance',
    title: 'Business & Finance',
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { id: 'credits', title: 'Credits', icon: <CreditCard className="w-4 h-4" />, path: '/admin/credits' },
      { id: 'subscriptions', title: 'Subscriptions', icon: <DollarSign className="w-4 h-4" />, path: '/admin/subscriptions' },
      { id: 'revenue', title: 'Revenue Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/admin/revenue' },
      { id: 'billing', title: 'Billing', icon: <FileText className="w-4 h-4" />, path: '/admin/billing' }
    ]
  },
  {
    id: 'system-admin',
    title: 'System Administration',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { id: 'system-health', title: 'System Health', icon: <Server className="w-4 h-4" />, path: '/admin/system' },
      { id: 'performance', title: 'Performance Metrics', icon: <Activity className="w-4 h-4" />, path: '/admin/system/performance' },
      { id: 'configuration', title: 'Configuration', icon: <Settings className="w-4 h-4" />, path: '/admin/system/config' },
      { id: 'monitoring', title: 'Monitoring & Alerts', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/system/monitoring' }
    ]
  },
  {
    id: 'content-management',
    title: 'Content Management',
    icon: <FileText className="w-5 h-5" />,
    children: [
      { id: 'materials', title: 'Materials', icon: <FileText className="w-4 h-4" />, path: '/admin/content' },
      { id: 'moderation', title: 'Moderation', icon: <Shield className="w-4 h-4" />, path: '/admin/content/moderation' },
      { id: 'categories', title: 'Categories & Tags', icon: <FileCheck className="w-4 h-4" />, path: '/admin/content/categories' },
      { id: 'content-analytics', title: 'Content Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/content/analytics' }
    ]
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance',
    icon: <Shield className="w-5 h-5" />,
    children: [
      { id: 'security-settings', title: 'Security Settings', icon: <Lock className="w-4 h-4" />, path: '/admin/security/settings' },
      { id: 'audit-logs', title: 'Audit Logs', icon: <FileText className="w-4 h-4" />, path: '/admin/security/audit' },
      { id: 'banned-content', title: 'Banned Content', icon: <Shield className="w-4 h-4" />, path: '/admin/security/banned' },
      { id: 'security-analytics', title: 'Security Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/security/analytics' }
    ]
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    icon: <Code className="w-5 h-5" />,
    children: [
      { id: 'feature-flags', title: 'Feature Flags', icon: <Flag className="w-4 h-4" />, path: '/admin/dev' },
      { id: 'api-management', title: 'API Management', icon: <Database className="w-4 h-4" />, path: '/admin/dev/api' },
      { id: 'testing-tools', title: 'Testing Tools', icon: <TestTube className="w-4 h-4" />, path: '/admin/dev/testing' },
      { id: 'documentation', title: 'Documentation', icon: <BookOpen className="w-4 h-4" />, path: '/admin/dev/docs' }
    ]
  }
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, currentPath }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['user-management']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  const isParentActive = (section: AdminSection) => {
    return section.children?.some(child => child.path && isActive(child.path));
  };

  return (
    <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
      collapsed ? 'w-16' : 'w-64'
    } lg:static lg:translate-x-0 ${collapsed ? '' : 'translate-x-0'} md:${collapsed ? '' : '-translate-x-full'}`}>
      
      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto">
        <nav className="p-4 pt-6 space-y-2">
          {adminSections.map((section) => (
            <div key={section.id}>
              {section.path ? (
                // Top-level navigation item (like Mission Control, Analytics, Notifications)
                <Link
                  to={section.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(section.path)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.icon}
                  {!collapsed && (
                    <span className="font-medium text-sm">{section.title}</span>
                  )}
                </Link>
              ) : (
                // Expandable section (like User Management, Business & Finance, etc.)
                <>
                  {/* Section Header */}
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isParentActive(section) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => !collapsed && toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      {!collapsed && (
                        <span className="font-medium text-sm">{section.title}</span>
                      )}
                    </div>
                    {!collapsed && section.children && (
                      <div className="text-gray-400">
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Children */}
                  {!collapsed && section.children && expandedSections.has(section.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path || '#'}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            child.path && isActive(child.path)
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {child.icon}
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Collapsed tooltips */}
              {collapsed && (
                <div className="relative group">
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {section.title}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
