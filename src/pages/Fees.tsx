
import React from 'react';
import Navigation from '@/components/Navigation';
import FeesManagement from '@/components/FeesManagement';

const Fees = () => {
  return (
    <>
      <Navigation activeSection="fees" onSectionChange={() => {}} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl shadow-blue-500/10">
            <div className="text-center border-b border-gray-200/60 pb-6 sm:pb-8 mb-6 sm:mb-8 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    FEES MANAGEMENT
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium">
                    Student Fee Tracking and Payment Management
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <FeesManagement />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Fees;
