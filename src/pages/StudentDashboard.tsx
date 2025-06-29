import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, BookOpen, GraduationCap, CreditCard, Home, Trophy } from 'lucide-react';
import StudentHomework from '@/components/StudentHomework';
import StudentMarks from '@/components/StudentMarks';
import StudentFeeDetails from '@/components/StudentFeeDetails';
import StudentLeaderboard from '@/components/StudentLeaderboard';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import DarkModeToggle from '@/components/DarkModeToggle';
import '@/styles/dark-mode.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header with improved layout */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            {/* Top section with logo and action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              {/* Logo and basic info */}
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                  alt="Logo" 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    Student Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Visiona Education Academy
                  </p>
                </div>
              </div>
              
              {/* Action buttons - positioned in top right */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <DarkModeToggle />
                <Button 
                  variant="outline" 
                  onClick={handleBackToHome}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>

            {/* Welcome section with improved layout */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Student info section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  {/* Profile placeholder/avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  </div>
                  
                  {/* Student details */}
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="mb-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                        Welcome, {studentData.full_name}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        We're glad to have you back!
                      </p>
                    </div>
                    
                    {/* Key info badges */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                        Class: {studentData.class}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                        Admission: {studentData.admission_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick stats or additional info */}
                <div className="lg:text-right">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    Member since
                  </p>
                  <p className="text-sm sm:text-base font-medium text-gray-700">
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
                <User className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="homework" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Homework</span>
              </TabsTrigger>
              <TabsTrigger value="marks" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Marks</span>
              </TabsTrigger>
              <TabsTrigger value="fees" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Fees</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User className="h-5 w-5" />
                    Student Profile
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Your personal information and academic details</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Personal Information */}
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Personal Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{studentData.full_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1">
                            {new Date(studentData.date_of_birth).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Gender</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1 capitalize">{studentData.gender}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Contact Number</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1">{studentData.contact_number}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1 break-all">{studentData.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Academic Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Class</label>
                          <p className="text-base sm:text-lg font-semibold text-blue-600 mt-1">{studentData.class}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Admission Number</label>
                          <p className="text-base sm:text-lg font-semibold text-green-600 mt-1">{studentData.admission_number}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Current School</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1">{studentData.current_school}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Father's Name</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1">{studentData.father_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Mother's Name</label>
                          <p className="text-base sm:text-lg text-gray-900 mt-1">{studentData.mother_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exams Preparing For */}
                  {studentData.exams_preparing_for && studentData.exams_preparing_for.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Preparing for Exams
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {studentData.exams_preparing_for.map((exam: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {exam}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="homework" className="mt-6">
              <StudentHomework />
            </TabsContent>

            <TabsContent value="marks" className="mt-6">
              <StudentMarks />
            </TabsContent>

            <TabsContent value="fees" className="mt-6">
              <StudentFeeDetails />
            </TabsContent>
          </Tabs>

          {/* Leaderboard Section - Moved to bottom */}
          <div className="mt-8">
            <StudentLeaderboard />
          </div>
        </div>
      </div>
    </DarkModeProvider>
  );
};

export default StudentDashboard;