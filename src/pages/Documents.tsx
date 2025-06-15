import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Image, File } from 'lucide-react';

const Documents = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          {/* Header */}
          <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg mb-6">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 rounded-t-lg p-4 sm:p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">UPLOAD DOCUMENTS</h1>
              <p className="text-sm sm:text-base lg:text-lg text-blue-100">Student Document Management System</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Student Photos */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-600" />
                      Student Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Upload and manage student photograph documents</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop photos here or click to browse</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Documents */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Academic Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Upload transcripts, certificates, and academic records</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop documents here or click to browse</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Other Documents */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5 text-purple-600" />
                      Other Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Upload ID cards, medical records, and other documents</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop files here or click to browse</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Uploads */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">No documents uploaded yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documents;
