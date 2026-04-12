import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Moon, Sun, Home, FileText, Users, BookOpen, GraduationCap, CreditCard, Upload, CheckCircle2, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import FloatingNavbar from '@/components/FloatingNavbar';
import { AdminNotificationDialog } from '@/components/notifications/AdminNotificationDialog';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminNavItems = [
        { id: 'home', label: 'Home', path: '/admin-dashboard', icon: Home },
        { id: 'admission', label: 'Admission', path: '/admission', icon: FileText },
        { id: 'students', label: 'Students', path: '/students', icon: Users },
        { id: 'homework', label: 'Homework', path: '/homework', icon: BookOpen },
        { id: 'marks', label: 'Marks', path: '/marks', icon: GraduationCap },
        { id: 'fees', label: 'Fees', path: '/fees', icon: CreditCard },
        { id: 'documents', label: 'Documents', path: '/documents', icon: Upload },
        { id: 'quizzes', label: 'Quizzes', path: '/quizzes', icon: CheckCircle2 },
        { id: 'logout', label: 'Logout', icon: LogOut },
    ];

    const activeAdminId = adminNavItems.find((item) => item.path === location.pathname)?.id || 'home';

    const handleAdminNavChange = (id: string) => {
        if (id === 'logout') {
            handleLogout();
            return;
        }

        const target = adminNavItems.find((item) => item.id === id);
        if (target?.path) {
            navigate(target.path);
        }
    };

    return (
        <div className={`fixed inset-0 overflow-hidden flex transition-colors duration-300 ${isDarkMode ? 'dark bg-[#020617] text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className={`flex-none min-h-16 sm:min-h-20 flex items-center justify-between px-4 sm:px-6 border-b ${isDarkMode ? 'bg-[#0B1121]/80 border-white/5' : 'bg-white border-gray-200'} backdrop-blur-md z-10 pt-[env(safe-area-inset-top)]`}>
                    <div className="flex items-center gap-4">
                        {/* Logo for mobile */}
                        <div className="flex items-center gap-2 md:hidden">
                            <img
                                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png"
                                alt="Logo"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-bold text-lg">
                                Visiona <span className="text-emerald-500">Admin</span>
                            </span>
                        </div>

                        {/* Search Bar (Visual Only) */}
                        <div className={`hidden md:flex items-center px-4 py-2 rounded-full w-64 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        </Button>
                        <AdminNotificationDialog />
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-700/20">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold leading-none">{user?.name || 'Admin'}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {(user?.name || 'A').charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area - Add padding bottom for mobile nav */}
                <main className="flex-1 overflow-y-auto pb-36">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <Outlet context={{ isDarkMode }} />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <FloatingNavbar
                role="admin"
                items={adminNavItems}
                activeId={activeAdminId}
                isDarkMode={isDarkMode}
                onChange={handleAdminNavChange}
            />
        </div>
    );
};

export default AdminLayout;
