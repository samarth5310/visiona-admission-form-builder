
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import AdmissionForm from '@/components/AdmissionForm';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';

const Admission = () => {
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
        activeSection="admission"
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
                  <h1 className="text-lg font-bold text-gray-900">
                    Admission Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Student Admission Form and Processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <AdmissionForm />
        </div>
      </div>
    </div>
  );
};

export default Admission;
