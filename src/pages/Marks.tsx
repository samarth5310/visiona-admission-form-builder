
import React from 'react';
import Navigation from '@/components/Navigation';
import MarksManagement from '@/components/MarksManagement';

const Marks = () => {
  return (
    <>
      <Navigation activeSection="marks" onSectionChange={() => {}} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6 sm:py-8">
          <div className="bg-white border border-purple-100 rounded-2xl shadow-xl overflow-hidden">
            <div className="admin-gradient-primary p-6 sm:p-8 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                MARKS MANAGEMENT
              </h1>
              <p className="text-base sm:text-lg text-purple-100">
                Student Test Scores and Performance Tracking
              </p>
            </div>
            <div className="p-6 sm:p-8 lg:p-12">
              <MarksManagement />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Marks;
