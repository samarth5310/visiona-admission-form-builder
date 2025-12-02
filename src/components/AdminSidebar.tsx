import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Users, BookOpen, GraduationCap, CreditCard, Upload, LogOut, Home } from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    isDarkMode?: boolean;
}

const AdminSidebar = ({
    isOpen,
    onClose,
    onLogout,
    isDarkMode = true
}: AdminSidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigationItems = [
        {
            path: '/admission',
            label: 'Admission',
            icon: FileText,
            color: 'text-blue-500'
        },
        {
            path: '/students',
            label: 'Students',
            icon: Users,
            color: 'text-purple-500'
        },
        {
            path: '/homework',
            label: 'Homework',
            icon: BookOpen,
            color: 'text-green-500'
        },
        {
            path: '/marks',
            label: 'Marks',
            icon: GraduationCap,
            color: 'text-orange-500'
        },
        {
            path: '/fees',
            label: 'Fees',
            icon: CreditCard,
            color: 'text-pink-500'
        },
        {
            path: '/documents',
            label: 'Documents',
            icon: Upload,
            color: 'text-cyan-500'
        },
    ];

    const handleItemClick = (path: string) => {
        navigate(path);
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
        fixed top-0 left-0 h-full w-64 shadow-xl transform transition-all duration-300 ease-out z-50 border-r flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isDarkMode ? 'bg-[#0B1121] border-white/5' : 'bg-white border-gray-200'}
        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
      `}>
                {/* Header */}
                <div className="flex items-center justify-center p-8">
                    <div className="flex items-center gap-2">
                        <img
                            src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Visiona <span className="text-blue-500">Admin</span>
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => handleItemClick('/admin-dashboard')}
                        className={`
              w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200
              ${location.pathname === '/admin-dashboard'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : `${isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                            }
            `}
                    >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            <Home className="w-full h-full" />
                        </div>
                        <span className="font-medium">Home</span>
                    </button>

                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleItemClick(item.path)}
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

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className={`
              w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 mt-4
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

export default AdminSidebar;
