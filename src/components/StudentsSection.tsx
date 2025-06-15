
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudentsSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold text-center">
              Students Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center text-gray-600">
              <h3 className="text-xl mb-4">Students Section</h3>
              <p>This section will contain student management features.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentsSection;
