
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import StudentsSection from '../components/StudentsSection';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CreditCard, Upload, Users } from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('admission');

  const renderSection = () => {
    switch (activeSection) {
      case 'admission':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="w-full shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6" />
                    Admission Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Admission Form Section</p>
                    <p className="text-gray-500 text-sm">This section will contain the admission form</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'students':
        return <StudentsSection />;
      case 'fees':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="w-full shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <CreditCard className="h-6 w-6" />
                    Fees Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Fees Management Section</p>
                    <p className="text-gray-500 text-sm">This section will contain fees management functionality</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="w-full shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                    <Upload className="h-6 w-6" />
                    Upload Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Document Upload Section</p>
                    <p className="text-gray-500 text-sm">This section will contain document upload functionality</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return <div>Select a section from the navigation</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      {renderSection()}
    </div>
  );
};

export default Index;
