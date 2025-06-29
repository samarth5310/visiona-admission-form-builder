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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Welcome, {studentData.full_name}
              </h1>
              <p className="text-sm text-gray-600">
                Class: {studentData.class} | Admission: {studentData.admission_number}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Leaderboard Section - Always visible at top */}
        <div className="mb-6">
          <StudentLeaderboard />
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Homework
            </TabsTrigger>
            <TabsTrigger value="marks" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Marks
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Profile
                </CardTitle>
                <CardDescription>Your personal information and academic details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-lg font-semibold">{studentData.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Class</label>
                      <p className="text-lg">{studentData.class}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admission Number</label>
                      <p className="text-lg">{studentData.admission_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="text-lg">{new Date(studentData.date_of_birth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <p className="text-lg capitalize">{studentData.gender}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Contact Number</label>
                      <p className="text-lg">{studentData.contact_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-lg">{studentData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current School</label>
                      <p className="text-lg">{studentData.current_school}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Father's Name</label>
                      <p className="text-lg">{studentData.father_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mother's Name</label>
                      <p className="text-lg">{studentData.mother_name}</p>
                    </div>
                  </div>
                </div>

                {studentData.exams_preparing_for && studentData.exams_preparing_for.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700">Preparing for Exams</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {studentData.exams_preparing_for.map((exam: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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

          <TabsContent value="homework">
            <StudentHomework />
          </TabsContent>

          <TabsContent value="marks">
            <StudentMarks />
          </TabsContent>

          <TabsContent value="fees">
            <StudentFeeDetails />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;