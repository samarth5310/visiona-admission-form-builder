import React from 'react';
import Navigation from '@/components/Navigation';
import MarksManagement from '@/components/MarksManagement';

const Marks = () => {
  return (
    <>
      <Navigation activeSection="marks" onSectionChange={() => {}} />
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <MarksManagement />
        </div>
      </div>
    </>
  );
};

export default Marks;