import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, Users, BookOpen, GraduationCap, CreditCard, FileText, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  const navItems = [
    { id: 'students', label: 'Students', icon: Users, path: '/students' },
    { id: 'homework', label: 'Homework', icon: BookOpen, path: '/homework' },
    { id: 'marks', label: 'Marks', icon: GraduationCap, path: '/marks' },
    { id: 'fees', label: 'Fees', icon: CreditCard, path: '/fees' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Visiona Admin</h1>
              <p className="text-xs text-gray-600">Education Management</p>
            </div>
          </div>

          {/* Navigation Items - Hidden on mobile */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-3 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToHome}
              className="hidden sm:flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-2 border-t border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 min-w-[70px]"
                  size="sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
