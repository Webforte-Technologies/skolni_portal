import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface AdminBreadcrumbsProps {
  currentPath: string;
}

const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ currentPath }) => {
  
  const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    
    if (!segments.includes('admin')) {
      return [{ title: 'Admin', path: '/admin/dashboard' }];
    }

    const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Admin', path: '/admin/dashboard' }
    ];

    // Map path segments to readable titles
    const pathMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'analytics': 'Analytics',
      'notifications': 'Notifikace',
      'users': 'Uživatelé',
      'schools': 'Školy', 
      'teachers': 'Učitelé',
      'roles': 'Role a oprávnění',
      'credits': 'Kredity',
      'subscriptions': 'Předplatná',
      'revenue': 'Analýza příjmů',
      'billing': 'Fakturace',
      'system': 'Systém',
      'health': 'Zdraví systému',
      'performance': 'Výkonnostní metriky',
      'config': 'Konfigurace',
      'monitoring': 'Monitoring',
      'content': 'Obsah',
      'materials': 'Materiály',
      'moderation': 'Moderování',
      'categories': 'Kategorie',
      'security': 'Bezpečnost',
      'settings': 'Nastavení',
      'audit': 'Audit logy',
      'banned': 'Zakázaný obsah',
      'dev': 'Vývojářské nástroje',
      'flags': 'Feature flagy',
      'api': 'API správa',
      'testing': 'Testovací nástroje',
      'docs': 'Dokumentace'
    };

    let currentPath = '/admin';
    
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      const title = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Don't add path for the last segment (current page)
      const isLast = i === segments.length - 1;
      breadcrumbs.push({
        title,
        path: isLast ? undefined : currentPath
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(currentPath);

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Home className="w-4 h-4 text-gray-400" />
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          
          {item.path ? (
            <Link
              to={item.path}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.title}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;