
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Upload, Users, LogOut, BookOpen, GraduationCap, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudentsSection from '@/components/StudentsSection';

const Students = () => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
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
                <p className="text-xs text-gray-600">Student Management System</p>
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
                  className="flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Admission</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/students')}
                  className="flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-blue-100 text-blue-700"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Students</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/homework')}
                  className="flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Homework</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/marks')}
                  className="flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Marks</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/fees')}
                  className="flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Fees</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/documents')}
                  className="flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
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

      {/* Main Content */}
      <div className="pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">STUDENT MANAGEMENT</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Records and Database Management</p>
            </div>
            <div className="p-2 sm:p-4 lg:p-6">
              <StudentsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
