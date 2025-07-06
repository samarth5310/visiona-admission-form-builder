
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Upload, 
  FileText, 
  LogOut, 
  Home, 
  Menu, 
  X,
  Bell,
  Calendar,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  title: string;
  description: string;
}

const AdminLayout = ({ children, activeSection, title, description }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { path: '/admission', label: 'Admission', icon: FileText, section: 'admission' },
    { path: '/students', label: 'Students', icon: Users, section: 'students' },
    { path: '/homework', label: 'Homework', icon: BookOpen, section: 'homework' },
    { path: '/marks', label: 'Marks', icon: GraduationCap, section: 'marks' },
    { path: '/fees', label: 'Fees', icon: CreditCard, section: 'fees' },
    { path: '/documents', label: 'Documents', icon: Upload, section: 'documents' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Logo and Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-300 hover:text-white hover:bg-gray-700 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold text-white hidden sm:block">Admin Panel</span>
              </div>
            </div>

            {/* Center section - Navigation (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeSection === item.section
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Right section - Utilities */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700 hidden sm:flex"
              >
                <Bell className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700 hidden sm:flex"
              >
                <Calendar className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-2">
                <UserCircle className="h-8 w-8 text-gray-300" />
                <span className="text-sm text-gray-300 hidden sm:block">
                  {user?.name || 'Admin'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/')}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Home className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <span className="text-lg font-semibold text-white">Navigation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full justify-start space-x-3 py-3 px-4 rounded-lg transition-all ${
                    activeSection === item.section
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
              <p className="text-gray-300 text-sm sm:text-base">{description}</p>
            </div>
          </div>

          {/* Page Content */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
