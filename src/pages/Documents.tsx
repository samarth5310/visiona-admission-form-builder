import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

const Documents = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';
  
  const [documents, setDocuments] = useState({
    previousMarksheet: null as File | null,
    aadhaarCard: null as File | null,
    incomeCertificate: null as File | null,
    casteCertificate: null as File | null,
    otherDocuments: [] as File[]
  });
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState<Array<{id: string, full_name: string}>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const validateFileSize = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `File size must be less than 50KB. Current file is ${Math.round(file.size / 1024)}KB.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileUpload = (docType: string, file: File) => {
    if (validateFileSize(file)) {
      if (docType === 'other') {
        setDocuments(prev => ({
          ...prev,
          otherDocuments: [...prev.otherDocuments, file]
        }));
      } else {
        setDocuments(prev => ({
          ...prev,
          [docType]: file
        }));
      }
    }
  };

  const removeOtherDocument = (index: number) => {
    setDocuments(prev => ({
      ...prev,
      otherDocuments: prev.otherDocuments.filter((_, i) => i !== index)
    }));
  };

  const uploadDocuments = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student first.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let uploadedCount = 0;

      const documentTypes = [
        { file: documents.previousMarksheet, type: 'previous_marksheet' },
        { file: documents.aadhaarCard, type: 'aadhaar_card' },
        { file: documents.incomeCertificate, type: 'income_certificate' },
        { file: documents.casteCertificate, type: 'caste_certificate' }
      ];

      for (const doc of documentTypes) {
        if (doc.file) {
          const fileName = `${selectedStudent}/${doc.type}_${Date.now()}_${doc.file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('application-documents')
            .upload(fileName, doc.file);

          if (uploadError) throw uploadError;

          const { error: docError } = await supabase
            .from('application_documents')
            .insert({
              application_id: selectedStudent,
              document_type: doc.type,
              file_name: doc.file.name,
              file_path: uploadData.path
            });

          if (docError) throw docError;
          uploadedCount++;
        }
      }

      for (const file of documents.otherDocuments) {
        const fileName = `${selectedStudent}/other_document_${Date.now()}_${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('application-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: docError } = await supabase
          .from('application_documents')
          .insert({
            application_id: selectedStudent,
            document_type: 'other_document',
            file_name: file.name,
            file_path: uploadData.path
          });

        if (docError) throw docError;
        uploadedCount++;
      }

      toast({
        title: "Success!",
        description: `${uploadedCount} documents uploaded successfully!`,
      });

      setDocuments({
        previousMarksheet: null,
        aadhaarCard: null,
        incomeCertificate: null,
        casteCertificate: null,
        otherDocuments: []
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <>
      <Navigation activeSection="documents" onSectionChange={() => {}} />
      
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Admin info section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                {/* Logo - larger size */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img 
                    src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                    alt="Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  />
                </div>
                
                {/* Admin details */}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="mb-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                      Welcome, {adminName}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Document Management System
                    </p>
                  </div>
                  
                  {/* Role badge */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                      Role: Administrator
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white rounded-lg shadow-lg glass-effect">
            <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">UPLOAD DOCUMENTS</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Document Upload and Management System</p>
            </div>
            
            <div className="p-2 sm:p-4 lg:p-6 space-y-6">
              {/* Student Selection */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Student</h3>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder={loadingStudents ? "Loading students..." : "Choose a student"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                    {loadingStudents ? (
                      <SelectItem value="loading" disabled>Loading students...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="no-students" disabled>No students found</SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedStudent && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Selected: {students.find(s => s.id === selectedStudent)?.full_name}
                  </p>
                )}
              </div>

              {/* Document Upload Sections */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Upload Documents</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Previous Marksheet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous Marksheet</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('previousMarksheet', e.target.files[0]);
                        }
                      }}
                      className="border-gray-300"
                      disabled={!selectedStudent}
                    />
                    {documents.previousMarksheet && (
                      <p className="text-sm text-green-600 mt-1">✓ {documents.previousMarksheet.name}</p>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('aadhaarCard', e.target.files[0]);
                        }
                      }}
                      className="border-gray-300"
                      disabled={!selectedStudent}
                    />
                    {documents.aadhaarCard && (
                      <p className="text-sm text-green-600 mt-1">✓ {documents.aadhaarCard.name}</p>
                    )}
                  </div>

                  {/* Income Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Income Certificate</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('incomeCertificate', e.target.files[0]);
                        }
                      }}
                      className="border-gray-300"
                      disabled={!selectedStudent}
                    />
                    {documents.incomeCertificate && (
                      <p className="text-sm text-green-600 mt-1">✓ {documents.incomeCertificate.name}</p>
                    )}
                  </div>

                  {/* Caste Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Caste Certificate</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('casteCertificate', e.target.files[0]);
                        }
                      }}
                      className="border-gray-300"
                      disabled={!selectedStudent}
                    />
                    {documents.casteCertificate && (
                      <p className="text-sm text-green-600 mt-1">✓ {documents.casteCertificate.name}</p>
                    )}
                  </div>
                </div>

                {/* Other Documents */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Documents</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('other', e.target.files[0]);
                        e.target.value = ''; // Reset input to allow same file again
                      }
                    }}
                    className="border-gray-300"
                    disabled={!selectedStudent}
                  />
                  {!selectedStudent && (
                    <p className="text-sm text-gray-500 mt-1">Please select a student first</p>
                  )}
                  {documents.otherDocuments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Other Documents Added:</p>
                      {documents.otherDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOtherDocument(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={uploadDocuments}
                    disabled={uploading || !selectedStudent}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Documents"}
                  </Button>
                  {!selectedStudent && (
                    <p className="text-sm text-gray-500 mt-2">Please select a student to enable document upload</p>
                  )}
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
