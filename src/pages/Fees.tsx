
import React from 'react';
import Navigation from '@/components/Navigation';
import FeesManagement from '@/components/FeesManagement';

const Fees = () => {
  return (
    <>
      <Navigation activeSection="fees" onSectionChange={() => {}} />
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto py-4 sm:py-6 bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg">
          <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-lg p-3 sm:p-6 mx-2 sm:mx-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">FEES MANAGEMENT</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Fee Tracking and Payment Management</p>
          </div>
          <FeesManagement />
        </div>
      </div>
    </>
  );
};

export default Fees;
