import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Home } from 'lucide-react';
import StudentHomework from '@/components/StudentHomework';
import AdminHomework from '@/components/AdminHomework';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';

const Homework = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineUserType = () => {
      if (user) {
        console.log('Admin user detected:', user);
        setUserType('admin');
        setLoading(false);
        return;
      }

      const studentData = localStorage.getItem('visiona_student_data');
      if (studentData) {
        try {
          const parsedData = JSON.parse(studentData);
          console.log('Student user detected:', parsedData.full_name);
          setUserType('student');
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing student data:', error);
          localStorage.removeItem('visiona_student_data');
        }
      }

      console.log('No authenticated user found, redirecting to home');
      navigate('/', { replace: true });
    };

    determineUserType();
  }, [user, navigate]);

  const handleLogout = () => {
    if (userType === 'student') {
      localStorage.removeItem('visiona_student_data');
      navigate('/', { replace: true });
    } else if (userType === 'admin') {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handleBackToDashboard = () => {
    if (userType === 'student') {
      navigate('/student-dashboard');
    } else if (userType === 'admin') {
      navigate('/students');
    }
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

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (userType === 'admin') {
    return (
      <AdminLayout 
        activeSection="homework" 
        title="HOMEWORK MANAGEMENT"
        description="Create and Manage Student Assignments"
      >
        <div className="p-6">
          <AdminHomework />
        </div>
      </AdminLayout>
    );
  }

  // For student users, keep the existing layout
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
                Homework Portal
              </h1>
              <p className="text-sm text-gray-600">
                View your assignments
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
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
        <StudentHomework />
      </div>
    </div>
  );
};

export default Homework;
