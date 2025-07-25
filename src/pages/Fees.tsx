
import React from 'react';
import Navigation from '@/components/Navigation';
import FeesManagement from '@/components/FeesManagement';
import { useAuth } from '@/contexts/AuthContext';

const Fees = () => {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  return (
    <>
      <Navigation activeSection="fees" onSectionChange={() => {}} />
      
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Admin info section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                {/* Logo - larger size */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img 
                    src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                    alt="Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  />
                </div>
                
                {/* Admin details */}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="mb-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                      Welcome, {adminName}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Fees Management System
                    </p>
                  </div>
                  
                  {/* Role badge */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                      Role: Administrator
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-lg glass-effect">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">FEES MANAGEMENT</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Fee Tracking and Payment Management</p>
            </div>
            <div className="p-2 sm:p-4 lg:p-6">
              <FeesManagement />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Fees;
