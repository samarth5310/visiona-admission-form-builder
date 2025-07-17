
import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, GraduationCap, Users, FileText, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedStudents: 0,
    pendingReviews: 0,
    thisMonth: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentApplications();
    
    // Set up real-time subscriptions
    const applicationsChannel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          fetchStats();
          fetchRecentApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Total applications
      const { count: totalCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // This month applications
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const { count: thisMonthCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      setStats({
        totalApplications: totalCount || 0,
        approvedStudents: Math.floor((totalCount || 0) * 0.8), // Simulated approval rate
        pendingReviews: Math.floor((totalCount || 0) * 0.2), // Simulated pending rate
        thisMonth: thisMonthCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('full_name, class, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentApplications(data || []);
    } catch (error) {
      console.error('Error fetching recent applications:', error);
    }
  };

  const handleNewAdmission = () => {
    navigate('/admission');
  };

  const admissionStats = [
    {
      title: "Total Applications",
      value: stats.totalApplications.toString(),
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50/80 to-indigo-50/80"
    },
    {
      title: "Approved Students",
      value: stats.approvedStudents.toString(),
      icon: Users,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50/80 to-emerald-50/80"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews.toString(),
      icon: Calendar,
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-50/80 to-orange-50/80"
    },
    {
      title: "This Month",
      value: stats.thisMonth.toString(),
      icon: Award,
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50/80 to-pink-50/80"
    }
  ];

  const quickActions = [
    {
      title: "New Admission Form",
      description: "Start a new student admission process",
      icon: UserPlus,
      action: handleNewAdmission,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Review Applications",
      description: "Review pending admission applications",
      icon: FileText,
      action: () => navigate('/admission'),
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Student Records",
      description: "View and manage student records",
      icon: Users,
      action: () => navigate('/students'),
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Academic Programs",
      description: "Manage courses and programs",
      icon: GraduationCap,
      action: () => {},
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <>
      <Navigation activeSection="home" onSectionChange={() => {}} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl shadow-blue-500/10">
            <div className="text-center border-b border-gray-200/60 pb-6 sm:pb-8 mb-6 sm:mb-8 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    ADMIN DASHBOARD
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium">
                    Student Management System
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {admissionStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-soft">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm" onClick={action.action}>
                        <CardHeader className="pb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-800">{action.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-blue-200/50 text-blue-700 hover:bg-blue-50/80 rounded-xl"
                    onClick={() => navigate('/admission')}
                  >
                    View All
                  </Button>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Applied</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/60">
                        {recentApplications.map((application, index) => (
                          <tr key={index} className="hover:bg-blue-50/30 transition-colors duration-200">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{application.full_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{application.class}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(application.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Button size="sm" variant="outline" className="border-blue-200/50 text-blue-700 hover:bg-blue-50/80 rounded-lg">
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {recentApplications.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No recent applications
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
