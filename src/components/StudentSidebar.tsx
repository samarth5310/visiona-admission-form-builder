
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
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'homework', 
      label: 'Homework', 
      icon: BookOpen,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    { 
      id: 'marks', 
      label: 'Marks', 
      icon: GraduationCap,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'fees', 
      label: 'Fees', 
      icon: CreditCard,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    },
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-white via-gray-50/50 to-white shadow-xl transform transition-all duration-300 ease-out z-50 border-r border-gray-200/60
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-lg
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Navigation</h2>
              <p className="text-xs text-gray-600 font-medium">Student Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden hover:bg-white/60 transition-colors duration-200 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div
                key={item.id}
                className="transform transition-all duration-200 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full group relative overflow-hidden rounded-xl transition-all duration-300 transform
                    ${isActive 
                      ? `${item.bgColor} ${item.textColor} border ${item.borderColor} shadow-lg scale-[1.02]` 
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-md border border-transparent'
                    }
                  `}
                >
                  {/* Background gradient for active state */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-5`} />
                  )}
                  
                  <div className="relative flex items-center space-x-4 px-4 py-3.5">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg` 
                        : 'bg-gray-100 group-hover:bg-gray-200 text-gray-600'
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <span className={`
                        font-semibold text-sm tracking-wide transition-colors duration-300
                        ${isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}
                      `}>
                        {item.label}
                      </span>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${item.gradient} shadow-sm`} />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-200/60 p-4 space-y-3 bg-gradient-to-r from-gray-50 to-white">
          <Button
            variant="outline"
            onClick={onBackToHome}
            className="w-full flex items-center justify-center space-x-3 py-3 border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 rounded-lg font-medium"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-3 py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-300 rounded-lg font-medium"
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
