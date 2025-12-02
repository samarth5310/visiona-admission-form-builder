import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, BookOpen, GraduationCap, CreditCard, Home, LogOut, X } from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onBackToHome: () => void;
  isDarkMode?: boolean;
}

const StudentSidebar = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onLogout,
  onBackToHome,
  isDarkMode = true
}: StudentSidebarProps) => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: 'profile',
      label: 'Dashboard',
      icon: Home,
      color: 'text-blue-500'
    },
    {
      id: 'fees',
      label: 'Payment Info',
      icon: CreditCard,
      color: 'text-purple-500'
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: BookOpen,
      color: 'text-green-500'
    },
    {
      id: 'marks',
      label: 'Results',
      icon: GraduationCap,
      color: 'text-orange-500'
    },
  ];

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 shadow-xl transform transition-all duration-300 ease-out z-50 border-r flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none md:h-screen
        ${isDarkMode ? 'bg-[#0B1121] border-white/5' : 'bg-white border-gray-200'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-center p-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : `${isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                  }
                `}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Icon className={`w-full h-full ${isActive ? 'text-white' : ''}`} />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Logout Button - Part of the flow for consistent spacing */}
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200
              ${isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-red-400' : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'}
            `}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <LogOut className="w-full h-full" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default StudentSidebar;
