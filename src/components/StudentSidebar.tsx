import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, BookOpen, GraduationCap, CreditCard, Home, LogOut, X, ChevronRight } from 'lucide-react';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onBackToHome: () => void;
  isDarkMode?: boolean;
  studentData?: any;
}

const StudentSidebar = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onLogout,
  onBackToHome,
  isDarkMode = true,
  studentData
}: StudentSidebarProps) => {
  const navigate = useNavigate();
  const [showCourses, setShowCourses] = React.useState(false);

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
        ${isDarkMode ? 'bg-gradient-to-b from-[#0B1121] to-[#071010] border-emerald-900/30' : 'bg-white border-gray-200'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-center p-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-emerald-500'}`}>
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
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : `${isDarkMode ? 'text-gray-400 hover:bg-emerald-900/20 hover:text-emerald-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
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

          {/* Enrolled Courses Section */}
          <div className="pt-4 mt-4 border-t border-emerald-900/10">
            <button
              onClick={() => setShowCourses(!showCourses)}
              className={`
                w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-200
                ${isDarkMode ? 'text-gray-400 hover:bg-emerald-900/20 hover:text-emerald-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <BookOpen className="w-full h-full" />
                </div>
                <span className="font-medium">My Courses</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showCourses ? 'rotate-90' : ''}`} />
            </button>

            {showCourses && studentData?.exams_preparing_for && (
              <div className="mt-2 space-y-1 ml-4 border-l-2 border-emerald-900/20">
                {studentData.exams_preparing_for.map((exam: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(`/student/preparation/${exam.toLowerCase()}`);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-8 py-3 rounded-r-xl transition-all duration-200 text-sm
                      ${isDarkMode ? 'text-gray-500 hover:bg-emerald-900/10 hover:text-emerald-300' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <span className="font-medium">{exam} Prep</span>
                  </button>
                ))}
                {studentData.exams_preparing_for.length === 0 && (
                  <p className="px-8 py-2 text-xs text-gray-500 italic">No courses enrolled</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-auto pb-8">
            <button
              onClick={onLogout}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200
                ${isDarkMode ? 'text-gray-400 hover:bg-red-900/20 hover:text-red-400' : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'}
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <LogOut className="w-full h-full" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default StudentSidebar;
