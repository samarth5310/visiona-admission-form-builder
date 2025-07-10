
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Users, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Upload,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { id: 'students', label: 'Students', icon: Users, path: '/students' },
    { id: 'homework', label: 'Homework', icon: BookOpen, path: '/homework' },
    { id: 'marks', label: 'Marks', icon: BarChart3, path: '/marks' },
    { id: 'fees', label: 'Fees', icon: DollarSign, path: '/fees' },
    { id: 'documents', label: 'Documents', icon: Upload, path: '/documents' },
    { id: 'admission', label: 'Admission', icon: FileText, path: '/admission' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold admin-gradient-primary bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-600">Student Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'admin-gradient-primary text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-teal-50 hover:text-admin-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button and logout */}
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="border-admin-primary text-admin-primary hover:bg-admin-primary hover:text-white transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-admin-primary hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-teal-50">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 ${
                      isActive
                        ? 'admin-gradient-primary text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:text-admin-primary hover:shadow-md'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
