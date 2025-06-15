
import React, { useState } from 'react';
import Navigation from "@/components/Navigation";
import StudentsSection from "@/components/StudentsSection";
import FeesManagement from "@/components/FeesManagement";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeSection, setActiveSection] = useState('students');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'students':
        return <StudentsSection />;
      case 'fees':
        return <FeesManagement />;
      default:
        return <StudentsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg shadow">
            Welcome, {user?.name || 'Admin'}
          </span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-white text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {renderActiveSection()}
    </div>
  );
};

export default Index;
