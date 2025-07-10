
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Menu } from 'lucide-react';
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
      <div className="min-h-screen bg-student-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-student-primary mx-auto mb-4"></div>
          <p className="text-student-on-background/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-student-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-student-on-background/70">Redirecting...</p>
        </div>
      </div>
    );
  }

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card className="bg-student-surface border-student-primary/10 shadow-lg student-card-hover animate-fade-in">
            <CardHeader className="student-gradient-primary text-student-on-primary rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Student Profile
              </CardTitle>
              <CardDescription className="text-student-on-primary/80 text-sm sm:text-base">Your personal information and academic details</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-student-surface">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Personal Information */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg font-semibold text-student-on-surface border-b border-student-primary/20 pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-student-primary/5 rounded-lg border border-student-primary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Full Name</label>
                      <p className="text-base sm:text-lg font-semibold text-student-primary mt-1">{studentData.full_name}</p>
                    </div>
                    <div className="p-3 bg-student-secondary/5 rounded-lg border border-student-secondary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Date of Birth</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1">
                        {new Date(studentData.date_of_birth).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="p-3 bg-student-primary/5 rounded-lg border border-student-primary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Gender</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1 capitalize">{studentData.gender}</p>
                    </div>
                    <div className="p-3 bg-student-secondary/5 rounded-lg border border-student-secondary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Contact Number</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1">{studentData.contact_number}</p>
                    </div>
                    <div className="p-3 bg-student-primary/5 rounded-lg border border-student-primary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Email</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1 break-all">{studentData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg font-semibold text-student-on-surface border-b border-student-secondary/20 pb-2">
                    Academic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-student-secondary/5 rounded-lg border border-student-secondary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Class</label>
                      <p className="text-base sm:text-lg font-semibold text-student-secondary mt-1">{studentData.class}</p>
                    </div>
                    <div className="p-3 bg-student-primary/5 rounded-lg border border-student-primary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Admission Number</label>
                      <p className="text-base sm:text-lg font-semibold text-student-primary mt-1">{studentData.admission_number}</p>
                    </div>
                    <div className="p-3 bg-student-secondary/5 rounded-lg border border-student-secondary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Current School</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1">{studentData.current_school}</p>
                    </div>
                    <div className="p-3 bg-student-primary/5 rounded-lg border border-student-primary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Father's Name</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1">{studentData.father_name}</p>
                    </div>
                    <div className="p-3 bg-student-secondary/5 rounded-lg border border-student-secondary/10">
                      <label className="text-sm font-medium text-student-on-surface/70">Mother's Name</label>
                      <p className="text-base sm:text-lg text-student-on-surface mt-1">{studentData.mother_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exams Preparing For */}
              {studentData.exams_preparing_for && studentData.exams_preparing_for.length > 0 && (
                <div className="mt-8 pt-6 border-t border-student-primary/20">
                  <h3 className="text-lg font-semibold text-student-on-surface mb-4">
                    Preparing for Exams
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {studentData.exams_preparing_for.map((exam: string, index: number) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-4 py-2 bg-student-primary text-student-on-primary rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'homework':
        return <StudentHomework />;
      case 'marks':
        return <StudentMarks />;
      case 'fees':
        return <StudentFeeDetails />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-student-background flex">
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
        <div className="bg-student-surface shadow-lg border-b border-student-primary/10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              {/* Left side - Toggle and title */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden border-student-primary/20 text-student-primary hover:bg-student-primary/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                    alt="Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-student-on-surface truncate">
                      Student Dashboard
                    </h1>
                    <p className="text-sm text-student-on-surface/70">
                      Visiona Education Academy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome section */}
            <div className="student-gradient-primary rounded-xl p-4 sm:p-6 mt-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-student-on-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 backdrop-blur-sm">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-student-on-primary" />
                  </div>
                  
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="mb-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-student-on-primary mb-1">
                        Welcome, {studentData.full_name}
                      </h2>
                      <p className="text-sm sm:text-base text-student-on-primary/80">
                        We're glad to have you back!
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-student-on-primary/20 text-student-on-primary backdrop-blur-sm">
                        Class: {studentData.class}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-student-on-primary/20 text-student-on-primary backdrop-blur-sm">
                        Admission: {studentData.admission_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:text-right">
                  <p className="text-xs sm:text-sm text-student-on-primary/70 mb-1">
                    Member since
                  </p>
                  <p className="text-sm sm:text-base font-medium text-student-on-primary">
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

        {/* Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
          {renderActiveContent()}
          
          {/* Leaderboard Section - Only show on profile tab */}
          {activeTab === 'profile' && (
            <div className="mt-8">
              <StudentLeaderboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
