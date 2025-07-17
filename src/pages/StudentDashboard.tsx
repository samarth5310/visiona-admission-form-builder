
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Menu, Calendar, Award, BookOpen, CreditCard } from 'lucide-react';
import StudentHomework from '@/components/StudentHomework';
import StudentMarks from '@/components/StudentMarks';
import StudentFeeDetails from '@/components/StudentFeeDetails';
import StudentLeaderboard from '@/components/StudentLeaderboard';
import StudentSidebar from '@/components/StudentSidebar';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('visiona_student_data');
    if (!data) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setStudentData(parsedData);
    } catch (error) {
      console.error('Error parsing student data:', error);
      localStorage.removeItem('visiona_student_data');
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('visiona_student_data');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-100 animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Student Profile
                </CardTitle>
                <CardDescription className="text-base text-gray-600 font-medium">Your personal information and academic details</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="group hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Full Name</label>
                        <p className="text-lg font-bold text-gray-900 mt-2">{studentData.full_name}</p>
                      </div>
                      <div className="group hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date of Birth</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium">
                          {new Date(studentData.date_of_birth).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="group hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Gender</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium capitalize">{studentData.gender}</p>
                      </div>
                      <div className="group hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Number</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium">{studentData.contact_number}</p>
                      </div>
                      <div className="group hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium break-all">{studentData.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="group hover:bg-green-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Class</label>
                        <p className="text-lg font-bold text-green-600 mt-2">{studentData.class}</p>
                      </div>
                      <div className="group hover:bg-green-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Admission Number</label>
                        <p className="text-lg font-bold text-emerald-600 mt-2">{studentData.admission_number}</p>
                      </div>
                      <div className="group hover:bg-green-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Current School</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium">{studentData.current_school}</p>
                      </div>
                      <div className="group hover:bg-green-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Father's Name</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium">{studentData.father_name}</p>
                      </div>
                      <div className="group hover:bg-green-50/50 p-4 rounded-xl transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mother's Name</label>
                        <p className="text-lg text-gray-900 mt-2 font-medium">{studentData.mother_name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exams Preparing For */}
                {studentData.exams_preparing_for && studentData.exams_preparing_for.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900">Preparing for Exams</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {studentData.exams_preparing_for.map((exam: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'homework':
        return <div className="animate-in fade-in-50 duration-500"><StudentHomework /></div>;
      case 'marks':
        return <div className="animate-in fade-in-50 duration-500"><StudentMarks /></div>;
      case 'fees':
        return <div className="animate-in fade-in-50 duration-500"><StudentFeeDetails /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Sidebar */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Left side - Toggle and title */}
              <div className="flex items-center space-x-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <img 
                      src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                      alt="Logo" 
                      className="w-8 h-8 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Student Dashboard
                    </h1>
                    <p className="text-base text-gray-600 font-medium">
                      Visiona Education Academy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome section */}
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-8 border border-blue-200 mt-8 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="mb-4">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {studentData.full_name}!
                      </h2>
                      <p className="text-blue-100 text-lg font-medium">
                        Ready to continue your learning journey?
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Class: {studentData.class}
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        <Award className="h-4 w-4 mr-2" />
                        ID: {studentData.admission_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-blue-200 text-sm font-semibold mb-1">
                      Member since
                    </p>
                    <p className="text-white text-lg font-bold">
                      {new Date(studentData.created_at).toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          {renderActiveContent()}
          
          {/* Leaderboard Section - Only show on profile tab */}
          {activeTab === 'profile' && (
            <div className="mt-10 animate-in fade-in-50 duration-700 delay-200">
              <StudentLeaderboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
