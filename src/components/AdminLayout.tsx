import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminNotificationDialog } from '@/components/notifications/AdminNotificationDialog';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`fixed inset-0 overflow-hidden flex transition-colors duration-300 ${isDarkMode ? 'dark bg-[#020617] text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className={`flex-none min-h-16 sm:min-h-20 flex items-center justify-between px-4 sm:px-6 border-b ${isDarkMode ? 'bg-[#0B1121]/80 border-white/5' : 'bg-white border-gray-200'} backdrop-blur-md z-10 pt-[env(safe-area-inset-top)]`}>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>

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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {(user?.name || 'A').charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                    <Outlet context={{ isDarkMode }} />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
