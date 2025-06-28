
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import StudentsSection from '@/components/StudentsSection';
import MarksManagement from '@/components/MarksManagement';

const Students = () => {
  const [activeSection, setActiveSection] = useState('students');

  const renderContent = () => {
    switch (activeSection) {
      case 'students':
        return <StudentsSection />;
      case 'admission':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Admission section - Content to be implemented</p>
          </div>
        );
      case 'fees':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Fees section - Content to be implemented</p>
          </div>
        );
      case 'documents':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Documents section - Content to be implemented</p>
          </div>
        );
      case 'homework':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Homework section - Use /homework route</p>
          </div>
        );
      case 'marks':
        return <MarksManagement />;
      default:
        return <StudentsSection />;
    }
  };

  return (
    <>
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Students;
