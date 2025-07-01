
import React from 'react';
import HamburgerNavigation from '@/components/HamburgerNavigation';
import MarksManagement from '@/components/MarksManagement';

const Marks = () => {
  return (
    <>
      <HamburgerNavigation userType="admin" />
      <div className="page-with-hamburger-nav min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">MARKS MANAGEMENT</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Test Scores and Performance Tracking</p>
            </div>
            <div className="p-2 sm:p-4 lg:p-6">
              <MarksManagement />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Marks;
