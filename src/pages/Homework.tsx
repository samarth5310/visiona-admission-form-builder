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
  const { user, logout } = useAuth();
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineUserType = () => {
      // First priority: Check if admin is logged in through auth context
      if (user) {
        console.log('Admin user detected:', user);
        setUserType('admin');
        setLoading(false);
        return;
      }

      // Second priority: Check if student is logged in through localStorage
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

      // If neither admin nor student is logged in, redirect to home
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
              onClick={handleBackToDashboard}
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