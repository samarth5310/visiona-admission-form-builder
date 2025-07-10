
import React from 'react';
import Navigation from '@/components/Navigation';
import StudentsSection from '@/components/StudentsSection';
import { useAuth } from '@/contexts/AuthContext';

const Students = () => {
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';

  return (
    <>
      <Navigation activeSection="students" onSectionChange={() => {}} />
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-teal-50 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-lg admin-card-hover">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Admin info section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                {/* Logo */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="admin-gradient-primary p-4 rounded-2xl shadow-lg">
                    <img 
                      src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                      alt="Logo" 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter brightness-0 invert"
                    />
                  </div>
                </div>
                
                {/* Admin details */}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="mb-4">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold admin-gradient-primary bg-clip-text text-transparent mb-2">
                      Welcome, {adminName}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                      Student Management System
                    </p>
                  </div>
                  
                  {/* Role badge */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium admin-gradient-primary text-white shadow-lg">
                      Role: Administrator
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300">
                      Access: Full Control
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6 sm:py-8">
          <div className="bg-white border border-purple-100 rounded-2xl shadow-xl overflow-hidden">
            <div className="admin-gradient-primary p-6 sm:p-8 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                STUDENT MANAGEMENT
              </h1>
              <p className="text-base sm:text-lg text-purple-100">
                Student Records and Database Management
              </p>
            </div>
            <div className="p-6 sm:p-8 lg:p-12">
              <StudentsSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;
