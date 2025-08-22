import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './AdminBreadcrumbs';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader 
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar 
          collapsed={sidebarCollapsed}
          currentPath={location.pathname}
        />
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } lg:${sidebarCollapsed ? 'ml-16' : 'ml-64'} md:ml-0`}>
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 mt-16">
            <AdminBreadcrumbs currentPath={location.pathname} />
          </div>
          
          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;
