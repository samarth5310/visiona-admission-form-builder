import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { safeStorage } from '@/utils/safeStorage';

const MobileRoleSelection = () => {
    const navigate = useNavigate();
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkExistingLogin = async () => {
            try {
                // Student session persistence (stored local profile)
                const studentData = safeStorage.getItem('visiona_student_data');
                if (studentData) {
                    navigate('/student-dashboard', { replace: true });
                    return;
                }

                // Admin session persistence (Supabase auth session)
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    navigate('/admin-dashboard', { replace: true });
                    return;
                }
            } finally {
                if (mounted) setCheckingSession(false);
            }
        };

        checkExistingLogin();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    if (checkingSession) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center pt-[env(safe-area-inset-top)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Checking login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6 space-y-8 pt-[env(safe-area-inset-top)]">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Visiona</h1>
                <p className="text-gray-500">Please select your role to continue</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <Card
                    onClick={() => navigate('/student-login')}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500 group active:scale-95"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-600 transition-colors">
                            <GraduationCap className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">Student</h3>
                            <p className="text-sm text-gray-500">Access your dashboard</p>
                        </div>
                    </div>
                </Card>

                <Card
                    onClick={() => navigate('/login')}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 group active:scale-95"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-600 transition-colors">
                            <User className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">Teacher / Admin</h3>
                            <p className="text-sm text-gray-500">Manage institution</p>
                        </div>
                    </div>
                </Card>
            </div>

            <p className="text-xs text-center text-gray-400 mt-8 absolute bottom-8">
                Version 1.0.0
            </p>
        </div>
    );
};

export default MobileRoleSelection;
