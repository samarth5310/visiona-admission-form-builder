import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School, Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const AdminDashboardHome = () => {
    const [studentCount, setStudentCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { count, error } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            setStudentCount(count || 0);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome to Visiona Education Academy Management System</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : studentCount}</div>
                        <p className="text-xs text-blue-100 mt-1">Active enrollments</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Academic Year</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2025-26</div>
                        <p className="text-xs text-purple-100 mt-1">Current Session</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-100">Academy Status</CardTitle>
                        <School className="h-4 w-4 text-green-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-green-100 mt-1">Operations Normal</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-100">Courses</CardTitle>
                        <GraduationCap className="h-4 w-4 text-orange-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">6+</div>
                        <p className="text-xs text-orange-100 mt-1">Navodaya, Sainik, etc.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Academy Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle>Academy Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Visiona Education Academy</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Specialized coaching center for competitive exams including Navodaya, Sainik, Morarji, Kittur, RMS, and Alvas entrance tests.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
                                <p className="font-semibold mt-1 dark:text-gray-200">7349420496</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                                <p className="font-semibold mt-1 dark:text-gray-200">Bagalkot, Karnataka</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for future widgets */}
                <Card className="dark:bg-gray-800 dark:border-gray-700 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-gray-400">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48 text-gray-400">
                        <p>More widgets coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardHome;
