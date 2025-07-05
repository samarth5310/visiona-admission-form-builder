
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User } from 'lucide-react';
import StudentsSection from '@/components/StudentsSection';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';

const Students = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminName = user?.name || 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        activeSection="students"
        onSectionChange={() => {}}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-6">
              {/* Left side - Toggle and title */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                    alt="Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      Student Management
                    </h1>
                    <p className="text-sm text-gray-600">
                      Visiona Education Academy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Admin info section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  {/* Logo - larger size */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img 
                      src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                      alt="Logo" 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                  </div>
                  
                  {/* Admin details */}
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="mb-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        Welcome, {adminName}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        Student Management System
                      </p>
                    </div>
                    
                    {/* Role badge */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                        Role: Administrator
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
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
