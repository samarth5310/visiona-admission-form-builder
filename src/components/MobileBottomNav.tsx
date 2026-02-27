import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    FileText,
    Users,
    BookOpen,
    GraduationCap,
    CreditCard,
    Upload,
    LogOut,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';

interface NavItem {
    id: string;
    path?: string;
    label: string;
    icon: React.ElementType;
}

interface MobileBottomNavProps {
    type: 'admin' | 'student';
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onLogout: () => void;
}

const MobileBottomNav = ({ type, activeTab, onTabChange, onLogout }: MobileBottomNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);

    const adminNavItems: NavItem[] = [
        { id: 'home', path: '/admin-dashboard', label: 'Home', icon: Home },
        { id: 'admission', path: '/admission', label: 'Admit', icon: FileText },
        { id: 'students', path: '/students', label: 'Students', icon: Users },
        { id: 'quizzes', path: '/quizzes', label: 'Quizzes', icon: CheckCircle2 },
        { id: 'homework', path: '/homework', label: 'HW', icon: BookOpen },
        { id: 'marks', path: '/marks', label: 'Marks', icon: GraduationCap },
        { id: 'fees', path: '/fees', label: 'Fees', icon: CreditCard },
        { id: 'logout', label: 'Exit', icon: LogOut },
    ];

    const studentNavItems: NavItem[] = [
        { id: 'profile', label: 'Home', icon: Home },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'homework', label: 'HW', icon: FileText },
        { id: 'marks', label: 'Marks', icon: GraduationCap },
        { id: 'logout', label: 'Exit', icon: LogOut },
    ];

    const navItems = type === 'admin' ? adminNavItems : studentNavItems;

    const getActiveIndex = () => {
        if (type === 'admin') {
            return adminNavItems.findIndex(item => location.pathname === item.path);
        }
        return studentNavItems.findIndex(item => item.id === activeTab);
    };

    const activeIndex = getActiveIndex();

    const handleItemClick = (item: NavItem, index: number) => {
        if (item.id === 'logout') {
            onLogout();
            return;
        }

        if (type === 'admin' && item.path) {
            navigate(item.path);
        } else if (type === 'student' && onTabChange) {
            onTabChange(item.id);
        }
    };

    // Student styling: Minimalist, compact, no gradients
    if (type === 'student') {
        const gridCols = navItems.length;
        return (
            <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden flex justify-center">
                <div className="bg-[#0B1121]/90 backdrop-blur-xl rounded-full p-1 border border-white/5 shadow-2xl max-w-md w-full">
                    <div className={`relative grid grid-cols-${gridCols}`}>
                        {/* Compact Indicator */}
                        <div
                            className="absolute top-1 bottom-1 bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                            style={{
                                left: `${activeIndex * (100 / gridCols)}%`,
                                width: `${100 / gridCols}%`,
                                transform: 'scale(0.85)'
                            }}
                        />

                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = index === activeIndex;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item, index)}
                                    className="relative flex flex-col items-center justify-center py-2 z-10"
                                >
                                    <Icon className={`w-4 h-4 mb-0.5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                    <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Admin styling: Compact scrollable with solid active states
    return (
        <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden flex justify-center">
            <div className="bg-[#0B1121]/90 backdrop-blur-xl rounded-2xl p-1.5 border border-white/5 shadow-2xl w-full max-w-lg">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-1 overflow-x-auto scrollbar-hide w-full"
                >
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = index === activeIndex;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item, index)}
                                className={`
                                    relative flex flex-col items-center justify-center min-w-[3.5rem] py-2 px-1 rounded-xl transition-all duration-200
                                    ${isActive ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}
                                `}
                            >
                                <Icon className="w-4 h-4 mb-0.5" />
                                <span className="text-[9px] font-bold uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileBottomNav;
