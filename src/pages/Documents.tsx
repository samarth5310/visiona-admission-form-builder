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
import { Upload, FileText, Check } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto py-6 sm:py-8">
          <div className="bg-white border border-purple-100 rounded-2xl shadow-xl overflow-hidden admin-card-hover">
            <div className="admin-gradient-primary p-6 sm:p-8 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                UPLOAD DOCUMENTS
              </h1>
              <p className="text-base sm:text-lg text-purple-100">
                Document Upload and Management System
              </p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-8">
              {/* Student Selection */}
              <div className="bg-gradient-to-r from-purple-50 to-teal-50 p-6 rounded-xl border border-purple-100 admin-card-hover">
                <h3 className="text-xl font-semibold admin-gradient-primary bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-admin-primary" />
                  Select Student
                </h3>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="border-purple-200 bg-white hover:border-admin-primary focus:border-admin-primary focus:ring-admin-primary transition-all duration-200">
                    <SelectValue placeholder={loadingStudents ? "Loading students..." : "Choose a student"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-purple-200 shadow-xl z-50">
                    {loadingStudents ? (
                      <SelectItem value="loading" disabled>Loading students...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="no-students" disabled>No students found</SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id} className="hover:bg-purple-50">
                          {student.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedStudent && (
                  <p className="text-sm text-green-600 mt-3 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Selected: {students.find(s => s.id === selectedStudent)?.full_name}
                  </p>
                )}
              </div>

              {/* Document Upload Sections */}
              <div className="bg-gradient-to-r from-purple-50 to-teal-50 p-6 rounded-xl border border-purple-100 admin-card-hover">
                <h3 className="text-xl font-semibold admin-gradient-primary bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-admin-primary" />
                  Upload Documents
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Previous Marksheet */}
                  <div className="bg-white p-4 rounded-lg border border-purple-100 hover:border-admin-primary transition-all duration-200 admin-card-hover">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Previous Marksheet</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('previousMarksheet', e.target.files[0]);
                        }
                      }}
                      className="border-purple-200 focus:border-admin-primary focus:ring-admin-primary"
                      disabled={!selectedStudent}
                    />
                    {documents.previousMarksheet && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {documents.previousMarksheet.name}
                      </p>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="bg-white p-4 rounded-lg border border-purple-100 hover:border-admin-primary transition-all duration-200 admin-card-hover">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Aadhaar Card</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('aadhaarCard', e.target.files[0]);
                        }
                      }}
                      className="border-purple-200 focus:border-admin-primary focus:ring-admin-primary"
                      disabled={!selectedStudent}
                    />
                    {documents.aadhaarCard && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {documents.aadhaarCard.name}
                      </p>
                    )}
                  </div>

                  {/* Income Certificate */}
                  <div className="bg-white p-4 rounded-lg border border-purple-100 hover:border-admin-primary transition-all duration-200 admin-card-hover">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Income Certificate</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('incomeCertificate', e.target.files[0]);
                        }
                      }}
                      className="border-purple-200 focus:border-admin-primary focus:ring-admin-primary"
                      disabled={!selectedStudent}
                    />
                    {documents.incomeCertificate && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {documents.incomeCertificate.name}
                      </p>
                    )}
                  </div>

                  {/* Caste Certificate */}
                  <div className="bg-white p-4 rounded-lg border border-purple-100 hover:border-admin-primary transition-all duration-200 admin-card-hover">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Caste Certificate</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload('casteCertificate', e.target.files[0]);
                        }
                      }}
                      className="border-purple-200 focus:border-admin-primary focus:ring-admin-primary"
                      disabled={!selectedStudent}
                    />
                    {documents.casteCertificate && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {documents.casteCertificate.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Other Documents */}
                <div className="mt-8 bg-white p-6 rounded-lg border border-purple-100 hover:border-admin-primary transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Other Documents</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('other', e.target.files[0]);
                        e.target.value = ''; // Reset input to allow same file again
                      }
                    }}
                    className="border-purple-200 focus:border-admin-primary focus:ring-admin-primary"
                    disabled={!selectedStudent}
                  />
                  {!selectedStudent && (
                    <p className="text-sm text-gray-500 mt-2">Please select a student first</p>
                  )}
                  {documents.otherDocuments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Other Documents Added:</p>
                      {documents.otherDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-admin-primary" />
                            {file.name}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOtherDocument(index)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
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
                    className="admin-gradient-primary text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 px-8 py-3 text-lg font-medium"
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
