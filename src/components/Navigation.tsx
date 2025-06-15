
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, FileText, CreditCard, Upload } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    { 
      id: 'students', 
      label: 'Students', 
      icon: Users, 
      path: '/',
      description: 'Student Management'
    },
    { 
      id: 'admission', 
      label: 'Admission Form', 
      icon: FileText, 
      path: '/admission',
      description: 'New Student Admission'
    },
    { 
      id: 'fees', 
      label: 'Fees Management', 
      icon: CreditCard, 
      path: '/fees',
      description: 'Fee Tracking'
    },
    { 
      id: 'documents', 
      label: 'Upload Documents', 
      icon: Upload, 
      path: '/documents',
      description: 'Document Management'
    }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Visiona Education Academy" 
                className="h-10 w-10 rounded-full bg-white p-1"
              />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold">Visiona Education Academy</h1>
              <p className="text-xs text-blue-100">Management System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-blue-100 hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-500/30">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs text-blue-200">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
