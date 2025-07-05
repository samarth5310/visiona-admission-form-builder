
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, BookOpen, GraduationCap, CreditCard, Home, LogOut, Gamepad2, X } from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onBackToHome: () => void;
}

const StudentSidebar = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange, 
  onLogout, 
  onBackToHome 
}: StudentSidebarProps) => {
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'marks', label: 'Marks', icon: GraduationCap },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'games', label: 'Games', icon: Gamepad2 },
  ];

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <Button
            variant="outline"
            onClick={onBackToHome}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
