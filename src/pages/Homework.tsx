
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen } from 'lucide-react';
import StudentHomework from '@/components/StudentHomework';
import AdminHomework from '@/components/AdminHomework';
import { useAuth } from '@/contexts/AuthContext';

const Homework = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('visiona_student_data');
    if (studentData) {
      setUserType('student');
      return;
    }

    // Check if admin is logged in
    if (user) {
      setUserType('admin');
      return;
    }

    // If neither, redirect to home
    navigate('/', { replace: true });
  }, [user, navigate]);

  const handleLogout = () => {
    if (userType === 'student') {
      localStorage.removeItem('visiona_student_data');
      navigate('/', { replace: true });
    } else if (userType === 'admin') {
      // Handle admin logout through auth context
      navigate('/login', { replace: true });
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Homework {userType === 'admin' ? 'Management' : 'Portal'}
              </h1>
              <p className="text-sm text-gray-600">
                {userType === 'admin' ? 'Manage homework assignments' : 'View your assignments'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(userType === 'student' ? '/student-dashboard' : '/students')}
            >
              Back to Dashboard
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {userType === 'student' ? (
          <StudentHomework />
        ) : (
          <AdminHomework />
        )}
      </div>
    </div>
  );
};

export default Homework;
