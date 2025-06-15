
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import AdmissionForm from '../components/AdmissionForm';
import FeesManagement from '../components/FeesManagement';
import StudentsSection from '../components/StudentsSection';
import DocumentUpload from '../components/DocumentUpload';

const Index = () => {
  const [activeSection, setActiveSection] = useState('admission');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'admission':
        return <AdmissionForm />;
      case 'students':
        return <StudentsSection />;
      case 'fees':
        return <FeesManagement />;
      case 'documents':
        return <DocumentUpload />;
      default:
        return <AdmissionForm />;
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
