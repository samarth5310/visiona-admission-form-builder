import React, { useState, useEffect } from 'react';
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
import AdminLayout from '@/components/AdminLayout';

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
    <AdminLayout 
      activeSection="documents" 
      title="UPLOAD DOCUMENTS"
      description="Document Upload and Management System"
    >
      <div className="p-6 space-y-6">
        {/* Student Selection */}
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Select Student</h3>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder={loadingStudents ? "Loading students..." : "Choose a student"} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {loadingStudents ? (
                <SelectItem value="loading" disabled>Loading students...</SelectItem>
              ) : students.length === 0 ? (
                <SelectItem value="no-students" disabled>No students found</SelectItem>
              ) : (
                students.map((student) => (
                  <SelectItem key={student.id} value={student.id} className="text-white">
                    {student.full_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedStudent && (
            <p className="text-sm text-green-400 mt-2">
              ✓ Selected: {students.find(s => s.id === selectedStudent)?.full_name}
            </p>
          )}
        </div>

        {/* Document Upload Sections */}
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-6">Upload Documents</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Previous Marksheet */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Previous Marksheet</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload('previousMarksheet', e.target.files[0]);
                  }
                }}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={!selectedStudent}
              />
              {documents.previousMarksheet && (
                <p className="text-sm text-green-400 mt-1">✓ {documents.previousMarksheet.name}</p>
              )}
            </div>

            {/* Aadhaar Card */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aadhaar Card</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload('aadhaarCard', e.target.files[0]);
                  }
                }}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={!selectedStudent}
              />
              {documents.aadhaarCard && (
                <p className="text-sm text-green-400 mt-1">✓ {documents.aadhaarCard.name}</p>
              )}
            </div>

            {/* Income Certificate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Income Certificate</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload('incomeCertificate', e.target.files[0]);
                  }
                }}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={!selectedStudent}
              />
              {documents.incomeCertificate && (
                <p className="text-sm text-green-400 mt-1">✓ {documents.incomeCertificate.name}</p>
              )}
            </div>

            {/* Caste Certificate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Caste Certificate</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload('casteCertificate', e.target.files[0]);
                  }
                }}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={!selectedStudent}
              />
              {documents.casteCertificate && (
                <p className="text-sm text-green-400 mt-1">✓ {documents.casteCertificate.name}</p>
              )}
            </div>
          </div>

          {/* Other Documents */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Other Documents</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload('other', e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="bg-gray-800 border-gray-600 text-white"
              disabled={!selectedStudent}
            />
            {!selectedStudent && (
              <p className="text-sm text-gray-400 mt-1">Please select a student first</p>
            )}
            {documents.otherDocuments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-300">Other Documents Added:</p>
                {documents.otherDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-600">
                    <span className="text-sm text-gray-300">{file.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOtherDocument(index)}
                      className="text-red-400 hover:text-red-300 border-gray-600"
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Documents"}
            </Button>
            {!selectedStudent && (
              <p className="text-sm text-gray-400 mt-2">Please select a student to enable document upload</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Documents;
