import React from 'react';
import { Button } from "@/components/ui/button";
import { User, BookOpen, GraduationCap, CreditCard, Home, LogOut, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const StudentSidebar = ({ activeSection, onSectionChange }: StudentSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('visiona_student_data');
    navigate('/', { replace: true });
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  const navigationItems = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'homework', label: 'Homework', icon: BookOpen },
    { key: 'marks', label: 'Marks', icon: GraduationCap },
    { key: 'fees', label: 'Fees', icon: CreditCard },
    { key: 'games', label: 'Games', icon: Gamepad2 },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r min-h-screen">
      {/* Logo Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Portal</h2>
            <p className="text-sm text-gray-600">Visiona Education</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              onClick={() => onSectionChange(item.key)}
              className={`w-full justify-start text-left px-3 py-3 ${
                activeSection === item.key 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="w-full justify-start text-left px-3 py-3"
          >
            <Home className="h-5 w-5 mr-3" />
            Back to Home
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-left px-3 py-3"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;