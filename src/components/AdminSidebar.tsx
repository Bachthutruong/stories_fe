"use client";

import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { LayoutDashboard, FileText, Users, ShieldAlert, ListFilter, Award, Settings, Menu, X } from 'lucide-react';
import React, { memo, useState } from 'react';

const adminNavItems = [
  { to: '/admin', label: '儀表板', icon: <LayoutDashboard /> },
  { to: '/admin/posts', label: '管理貼文', icon: <FileText /> },
  { to: '/admin/comments', label: '管理評論', icon: <FileText /> },
  { to: '/admin/users', label: '管理用戶', icon: <Users /> },
  { to: '/admin/reports', label: '管理舉報', icon: <ShieldAlert /> },
  { to: '/admin/keywords', label: '審核關鍵字', icon: <ListFilter /> },
  { to: '/admin/lottery', label: '抽獎活動', icon: <Award /> },
  { to: '/admin/settings', label: '網站設定', icon: <Settings /> },
];

// Memoized navigation item component
const AdminNavItem = memo(({ to, label, icon, isActive, onClick }: {
  to: string;
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick?: () => void;
}) => (
  <Button
    variant={isActive ? 'default' : 'ghost'}
    asChild
    className={`w-full justify-start transition-all duration-200 text-sm sm:text-base ${
      isActive 
        ? 'bg-green-600 text-white hover:bg-green-700' 
        : 'hover:bg-green-100 text-gray-700'
    }`}
    onClick={onClick}
  >
    <Link 
      to={to} 
      className="flex items-center space-x-2"
    >
      <div className={`h-4 w-4 ${isActive ? 'text-white' : 'text-green-600'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  </Button>
));

AdminNavItem.displayName = 'AdminNavItem';

const AdminSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Optimized active check function
  const isActiveRoute = (to: string) => {
    if (to === '/admin') {
      return pathname === to;
    }
    return pathname.startsWith(to);
  };

  const handleNavItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md border-green-200 hover:bg-green-50"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4 text-green-600" /> : <Menu className="h-4 w-4 text-green-600" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-green-50 text-gray-900 border-r border-green-200
        transition-transform duration-300 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:z-auto md:static
        w-64 p-4 space-y-2
        md:min-w-64 md:w-64
        shadow-lg md:shadow-none
      `}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-green-800">管理</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-green-600 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex flex-col space-y-1">
          {adminNavItems.map((item) => (
            <AdminNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isActive={isActiveRoute(item.to)}
              onClick={handleNavItemClick}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default memo(AdminSidebar);
