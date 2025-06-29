
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Upload, Users, LogOut, BookOpen, GraduationCap, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-600">Management System</p>
            </div>
            <h1 className="sm:hidden text-base font-bold text-gray-900">Admin</h1>
          </div>

          {/* Navigation Menu - Mobile Scroll */}
          <div className="flex-1 mx-4 sm:mx-6">
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/admission')}
                className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                  activeSection === 'admission' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Admission</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/students')}
                className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                  activeSection === 'students' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Students</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/homework')}
                className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                  activeSection === 'homework' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Homework</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/marks')}
                className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                  activeSection === 'marks' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Marks</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/fees')}
                className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                  activeSection === 'fees' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fees</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/documents')}
                className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                  activeSection === 'documents' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Documents</span>
              </Button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
