import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Menu, BookOpen, CreditCard, GraduationCap, Search, Bell, Moon, Sun, LogOut, Home, DollarSign, BarChart3, Calendar, ChevronRight } from 'lucide-react';
import StudentHomework from '@/components/StudentHomework';
import StudentMarks from '@/components/StudentMarks';
import StudentFeeDetails from '@/components/StudentFeeDetails';
import StudentSidebar from '@/components/StudentSidebar';
import StudentLeaderboard from '@/components/StudentLeaderboard';
import MobileBottomNav from '@/components/MobileBottomNav';
import { StudentNotificationBell } from '@/components/notifications/StudentNotificationBell';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { safeStorage } from '@/utils/safeStorage';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode to match landing page
  const { notifications } = useNotifications();

  const [fees, setFees] = useState<{ total: number; paid: number }>({ total: 0, paid: 0 });
  const [attendancePercentage, setAttendancePercentage] = useState<number>(0);

  useEffect(() => {
    const data = safeStorage.getItem('visiona_student_data');
    if (!data) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setStudentData(parsedData);
    } catch (error) {
      console.error('Error parsing student data:', error);
      safeStorage.removeItem('visiona_student_data');
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentData?.id) return;

      try {
        // Fetch fees
        const { data: feeData } = await (supabase
          .from('student_fees')
          .select('total_fees, paid_amount')
          .eq('application_id', studentData.id)
          .maybeSingle() as any);

        if (feeData) {
          setFees({ total: feeData.total_fees || 0, paid: feeData.paid_amount || 0 });
        }

        // Fetch attendance
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentData.id);

        if (attendanceData && attendanceData.length > 0) {
          const totalDays = attendanceData.length;
          const presentDays = attendanceData.filter((a: any) => a.status === 'Present').length;
          setAttendancePercentage(Math.round((presentDays / totalDays) * 100));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [studentData]);

  const handleLogout = () => {
    safeStorage.removeItem('visiona_student_data');
    navigate('/', { replace: true });
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!studentData) return null;

  const filteredNotifications = notifications.filter(n => {
    if (n.filter_type === 'all') return true;
    if (n.filter_type === 'class' && studentData?.class === n.filter_value) return true;
    if (n.filter_type === 'student' && (studentData?.id === n.filter_value || studentData?.admission_number === n.filter_value)) return true;
    return false;
  });

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={`border-0 shadow-lg ${isDarkMode ? 'bg-[#0B1121] text-white' : 'bg-white text-gray-900'}`}>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-100 text-blue-600'}`}>
                    <DollarSign className="h-7 w-7" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Fees</p>
                    <h3 className="text-3xl font-bold">₹{fees.total.toLocaleString()}</h3>
                    <p className="text-xs text-green-500 mt-0.5 font-medium">Paid: ₹{fees.paid.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-0 shadow-lg ${isDarkMode ? 'bg-[#0B1121] text-white' : 'bg-white text-gray-900'}`}>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-purple-500/10 text-purple-500' : 'bg-purple-100 text-purple-600'}`}>
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enrolled Courses</p>
                    <h3 className="text-3xl font-bold">{studentData.exams_preparing_for?.length || 0}</h3>
                    <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Active Programs</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-0 shadow-lg ${isDarkMode ? 'bg-[#0B1121] text-white' : 'bg-white text-gray-900'}`}>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-100 text-orange-600'}`}>
                    <BarChart3 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Attendance</p>
                    <h3 className="text-3xl font-bold">{attendancePercentage}%</h3>
                    <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Current Session</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details & Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className={`lg:col-span-2 border-0 shadow-lg ${isDarkMode ? 'bg-[#0B1121] text-white' : 'bg-white text-gray-900'}`}>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Student Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</label>
                        <p className="text-lg font-medium">{studentData.full_name}</p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Admission No</label>
                        <p className="text-lg font-medium">{studentData.admission_number}</p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Class</label>
                        <p className="text-lg font-medium">{studentData.class}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Parent's Name</label>
                        <p className="text-lg font-medium">{studentData.father_name}</p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Contact</label>
                        <p className="text-lg font-medium">{studentData.contact_number}</p>
                      </div>
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</label>
                        <p className="text-lg font-medium">{studentData.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Notice / Schedule */}
              <Card className={`border-0 shadow-lg ${isDarkMode ? 'bg-[#0B1121] text-white' : 'bg-white text-gray-900'}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">Daily Notice</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 p-0 h-auto">See all</Button>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {filteredNotifications.length === 0 ? (
                    <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No new notices.
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-semibold">Notification</span>
                          <span className="text-xs text-blue-500 font-medium">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Section */}
            <div className="animate-in fade-in-50 duration-700">
              <StudentLeaderboard />
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Enrolled Courses</h2>
              <p className="text-gray-500 dark:text-gray-400">Access your preparation portals and study materials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentData.exams_preparing_for?.map((exam: string, index: number) => (
                <Card
                  key={index}
                  className={`border border-white/5 shadow-2xl overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#0B1121] text-white' : 'bg-white text-gray-900'}`}
                  onClick={() => navigate(`/student/preparation/${exam.toLowerCase()}`)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center gap-5 mb-8">
                      <div className={`p-5 rounded-[2rem] ${isDarkMode ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'bg-blue-600 text-white'}`}>
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-2xl tracking-tight">{exam}</h4>
                        <p className={`text-[10px] uppercase tracking-widest font-black ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Official Portal</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Interactive Mock Tests
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        AI Performance Analysis
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                      Enter Portal <ChevronRight className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'homework':
        return <div className="slide-in-up"><StudentHomework /></div>;
      case 'marks':
        return <div className="slide-in-up"><StudentMarks /></div>;
      case 'fees':
        return <div className="slide-in-up"><StudentFeeDetails /></div>;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'dark bg-[#020617] text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <StudentSidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onBackToHome={handleBackToHome}
          isDarkMode={isDarkMode}
          studentData={studentData}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className={`min-h-20 flex items-center justify-between px-6 border-b ${isDarkMode ? 'bg-[#0B1121]/80 border-white/5' : 'bg-white border-gray-200'} backdrop-blur-md z-10 pt-[env(safe-area-inset-top)]`}>
          <div className="flex items-center gap-4">
            {/* Logo for mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {studentData.full_name.charAt(0)}
              </div>
              <span className="font-bold text-lg">
                <span className="text-emerald-500">Student</span>
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
            <StudentNotificationBell />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{studentData.full_name}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{studentData.class}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {studentData.full_name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area - Add padding bottom for mobile nav */}
        <main className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6">
          {/* Welcome Banner */}
          {activeTab === 'profile' && (
            <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="text-blue-100 mb-2 font-medium">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {studentData.full_name}!</h1>
                  <p className="text-blue-100/80 max-w-lg">Always stay updated in your student portal. Check your latest marks, fees status, and upcoming homework.</p>
                </div>
                <div className="hidden md:block">
                  {/* 3D-like illustration placeholder or icon */}
                  <GraduationCap className="h-32 w-32 text-white/20" />
                </div>
              </div>
            </div>
          )}

          {renderActiveContent()}
        </main>
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        type="student"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default StudentDashboard;
