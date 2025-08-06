"use client";

import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, PlusCircle, Newspaper, UserCircle, LogIn, LogOut, Shield, Trophy, User } from 'lucide-react';
import { useAuth } from '../components/providers/AuthProvider';

import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

// Memoize navigation items to prevent unnecessary re-renders
const NavItem = memo(({ to, isActive, icon, label }: {
  to: string;
  isActive: boolean;
  icon: React.ReactElement;
  label: string;
}) => (
  <Button 
    variant={isActive ? "secondary" : "ghost"} 
    size="sm" 
    asChild 
    className="px-2 md:px-3 transition-all duration-200"
  >
    <Link to={to} className="flex items-center space-x-1">
      {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" } as any)}
      <span className="hidden md:inline">{label}</span>
    </Link>
  </Button>
));

NavItem.displayName = 'NavItem';

const SiteHeader = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { to: '/', label: '首頁', icon: <Home /> },
    { to: '/posts', label: '所有夢想卡', icon: <Newspaper /> },
    { to: '/create-post', label: '上傳夢想卡', icon: <PlusCircle /> },
    { to: '/lottery-winners', label: '幸運卡友', icon: <Trophy /> },
  ];

  const userNavItems = user?.user ? [
    { to: '/my-account', label: '我的帳戶', icon: <UserCircle /> },
    { to: '/my-posts', label: '我的貼文', icon: <Newspaper /> },
  ] : [];

  const isUserNavActive = (to: string) => {
    return pathname === to || 
           (to !== `/users/${user?.user?.id}/posts` && pathname.startsWith(to)) || 
           (to === `/users/${user?.user?.id}/posts` && pathname.startsWith(to));
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center relative justify-end md:justify-between">
        {/* Left section: Logo */}
        <Link 
          to="/" 
          className="text-2xl font-headline text-primary hover:text-primary/80 transition-colors duration-200 z-10 hidden md:block"
        >
          希望夢想牆
        </Link>

        {/* Middle section: navItems - This will be centered */}
        <div className="flex justify-center items-center flex-1">
          <nav className="flex items-center space-x-1 md:space-x-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                isActive={pathname === item.to}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </div>

        {/* Right section: User/Login/Admin */}
        <div className="flex items-center space-x-1 md:space-x-2 z-10">
          {isLoading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          ) : user?.user ? (
            <>
              {user.user.role === 'admin' && (
                <Button 
                  variant={pathname.startsWith('/admin') ? "secondary" : "ghost"} 
                  size="sm" 
                  asChild 
                  className="px-2 md:px-3 transition-all duration-200"
                >
                  <Link to="/admin" className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2 md:px-3 flex items-center space-x-1 transition-all duration-200">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">帳戶</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="flex flex-col space-y-1">
                    {userNavItems.map((item) => (
                      <Button 
                        key={item.to} 
                        variant={isUserNavActive(item.to) ? "secondary" : "ghost"} 
                        size="sm" 
                        asChild 
                        className="w-full justify-start transition-all duration-200"
                      >
                        <Link to={item.to} className="flex items-center space-x-2">
                          {React.cloneElement(item.icon as React.ReactElement, { className: "h-4 w-4" } as any)}
                          <span>{item.label}</span>
                        </Link>
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={logout} 
                      className="w-full justify-start flex items-center space-x-2 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>登出</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button variant="default" size="sm" asChild className="px-2 md:px-3 transition-all duration-200">
              <Link to="/login" className="flex items-center space-x-1">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">登入</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default memo(SiteHeader);
