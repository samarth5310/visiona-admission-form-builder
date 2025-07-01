
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedNavigation from '@/components/AnimatedNavigation';
import StudentsSection from '@/components/StudentsSection';

const Students = () => {
  const { logout } = useAuth();

  const leftMenuItems = [
    { label: 'Home', path: '/' },
    { label: 'Students', path: '/students' },
    { label: 'Admission', path: '/admission' },
    { label: 'Homework', path: '/homework' },
    { label: 'Marks', path: '/marks' },
    { label: 'Fees', path: '/fees' },
    { label: 'Documents', path: '/documents' },
  ];

  const rightMenuItems = [
    { label: 'Dashboard', path: '/students' },
    { label: 'Profile', path: '/students' },
    { label: 'Settings', path: '/students' },
    { 
      label: 'Logout', 
      path: '/login',
      onClick: () => {
        logout();
      }
    },
  ];

  return (
    <div className="min-h-screen bg-black font-roboto">
      <AnimatedNavigation
        leftMenuItems={leftMenuItems}
        rightMenuItems={rightMenuItems}
        backgroundImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        title="Students"
      >
        <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg max-w-7xl mx-auto">
          <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">STUDENT MANAGEMENT</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Records and Database Management</p>
          </div>
          <div className="p-2 sm:p-4 lg:p-6">
            <StudentsSection />
          </div>
        </div>
      </AnimatedNavigation>
    </div>
  );
};

export default Students;
