
import React from 'react';
import Navigation from '@/components/Navigation';
import StudentsSection from '@/components/StudentsSection';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

const Students = () => {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  return (
    <>
      <Navigation activeSection="students" onSectionChange={() => {}} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full">
          {/* Welcome Section */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {adminName}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Student Management System - Manage student records and database
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <StudentsSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;
