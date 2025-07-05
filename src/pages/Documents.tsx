
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, FileText } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';

const Documents = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        activeSection="documents"
        onSectionChange={() => {}}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
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
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Student Document Management System
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
          <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">DOCUMENTS MANAGEMENT</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Document Management System</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Documents Management</p>
                <p className="text-gray-500 text-sm">Document management functionality will be implemented here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
