import React from 'react';
import Navigation from '@/components/Navigation';
import StudentsSection from '@/components/StudentsSection';

const Students = () => {
  return (
    <>
      <Navigation activeSection="students" onSectionChange={() => {}} />
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">STUDENT MANAGEMENT</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Records and Database Management</p>
            </div>
            <div className="p-2 sm:p-4 lg:p-6">
              <StudentsSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;