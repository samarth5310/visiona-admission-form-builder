
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from 'lucide-react';

const AdmissionForm = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Student Admission Form
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Admission Form</p>
            <p className="text-gray-500 text-sm">This section will contain the student admission form</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionForm;
