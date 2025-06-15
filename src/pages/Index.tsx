import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import StudentsSection from '../components/StudentsSection';
import FeesManagement from '../components/FeesManagement';
import AdmissionForm from '../components/AdmissionForm';
import DocumentUpload from '../components/DocumentUpload';

const Index = () => {
  const [activeSection, setActiveSection] = useState('admission');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'admission':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <AdmissionForm />
          </div>
        );
      case 'students':
        return <StudentsSection />;
      case 'fees':
        return <FeesManagement />;
      case 'documents':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <DocumentUpload />
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <AdmissionForm />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      {renderActiveSection()}
    </div>
  );
};

export default Index;
