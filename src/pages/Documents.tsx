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
import { Upload, FileText, Users } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

const Documents = () => {
  const { toast } = useToast();
  
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl shadow-blue-500/10">
            <div className="text-center border-b border-gray-200/60 pb-6 sm:pb-8 mb-6 sm:mb-8 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    DOCUMENT MANAGEMENT
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium">
                    Document Upload and Management System
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              {/* Student Selection */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-soft">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Select Student</h3>
                </div>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="border-blue-200/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 rounded-xl">
                    <SelectValue placeholder={loadingStudents ? "Loading students..." : "Choose a student"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-blue-100/50 shadow-xl rounded-xl z-50">
                    {loadingStudents ? (
                      <SelectItem value="loading" disabled>Loading students...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="no-students" disabled>No students found</SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id} className="hover:bg-blue-50/80 rounded-lg">
                          {student.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedStudent && (
                  <p className="text-sm text-green-600 mt-3 font-medium">
                    ✓ Selected: {students.find(s => s.id === selectedStudent)?.full_name}
                  </p>
                )}
              </div>

              {/* Document Upload Sections */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-soft">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Upload Documents</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Previous Marksheet */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Previous Marksheet</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('previousMarksheet', e.target.files[0]);
                        }
                      }}
                      className="border-blue-200/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-3 file:py-1"
                      disabled={!selectedStudent}
                    />
                    {documents.previousMarksheet && (
                      <p className="text-sm text-green-600 font-medium">✓ {documents.previousMarksheet.name}</p>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Aadhaar Card</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('aadhaarCard', e.target.files[0]);
                        }
                      }}
                      className="border-blue-200/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-3 file:py-1"
                      disabled={!selectedStudent}
                    />
                    {documents.aadhaarCard && (
                      <p className="text-sm text-green-600 font-medium">✓ {documents.aadhaarCard.name}</p>
                    )}
                  </div>

                  {/* Income Certificate */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Income Certificate</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('incomeCertificate', e.target.files[0]);
                        }
                      }}
                      className="border-blue-200/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-3 file:py-1"
                      disabled={!selectedStudent}
                    />
                    {documents.incomeCertificate && (
                      <p className="text-sm text-green-600 font-medium">✓ {documents.incomeCertificate.name}</p>
                    )}
                  </div>

                  {/* Caste Certificate */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Caste Certificate</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('casteCertificate', e.target.files[0]);
                        }
                      }}
                      className="border-blue-200/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-3 file:py-1"
                      disabled={!selectedStudent}
                    />
                    {documents.casteCertificate && (
                      <p className="text-sm text-green-600 font-medium">✓ {documents.casteCertificate.name}</p>
                    )}
                  </div>
                </div>

                {/* Other Documents */}
                <div className="mt-8 space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Other Documents</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('other', e.target.files[0]);
                        e.target.value = ''; // Reset input to allow same file again
                      }
                    }}
                    className="border-blue-200/50 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 rounded-xl file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-3 file:py-1"
                    disabled={!selectedStudent}
                  />
                  {!selectedStudent && (
                    <p className="text-sm text-gray-500">Please select a student first</p>
                  )}
                  {documents.otherDocuments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Other Documents Added:</p>
                      {documents.otherDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-blue-100/50">
                          <span className="text-sm text-gray-600 font-medium">{file.name}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOtherDocument(index)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50/80 rounded-lg"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Button
                    onClick={uploadDocuments}
                    disabled={uploading || !selectedStudent}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {uploading ? "Uploading..." : "Upload Documents"}
                  </Button>
                  {!selectedStudent && (
                    <p className="text-sm text-gray-500 mt-3">Please select a student to enable document upload</p>
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
