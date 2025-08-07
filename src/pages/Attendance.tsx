
import React from 'react';
import Navigation from '@/components/Navigation';
import AttendanceManagement from '@/components/AttendanceManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Users } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  return (
    <>
      <Navigation activeSection="attendance" onSectionChange={() => {}} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full">
          {/* Welcome Section */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {adminName}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Attendance Management System - Track student attendance records
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              {/* Header with logo */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <img 
                    src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                    alt="Visiona Education Academy Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain flex-shrink-0"
                  />
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">
                      ATTENDANCE MANAGEMENT
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                      Track and manage student attendance efficiently
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <AttendanceManagement />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Attendance;
