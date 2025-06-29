import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Phone, Mail, MapPin, Calendar, GraduationCap, User, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WhatsAppMessaging from './WhatsAppMessaging';

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  class: string;
  contact_number: string;
  email: string;
  father_name: string;
  mother_name: string;
  current_school: string;
  category: string;
  city: string;
  state: string;
  created_at: string;
  student_photo?: string;
}

const StudentsSection = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Desktop: 12 items, Mobile will show 4
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students data...');
      
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('applications')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('Connection test successful');

      // Fetch applications first
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw new Error(`Failed to fetch applications: ${applicationsError.message}`);
      }

      console.log('Applications fetched:', applications?.length || 0);

      // Fetch documents separately to avoid join issues
      const { data: documents, error: documentsError } = await supabase
        .from('application_documents')
        .select('application_id, document_type, file_path, file_name')
        .eq('document_type', 'student_photo');

      if (documentsError) {
        console.warn('Error fetching documents (non-critical):', documentsError);
      }

      console.log('Documents fetched:', documents?.length || 0);

      // Create a map of application_id to photo document
      const photoMap = new Map();
      if (documents) {
        documents.forEach(doc => {
          photoMap.set(doc.application_id, doc);
        });
      }

      const studentsWithPhotos: Student[] = (applications || []).map(app => {
        const photoDoc = photoMap.get(app.id);
        
        return {
          id: app.id,
          admission_number: app.admission_number || '',
          full_name: app.full_name || '',
          date_of_birth: app.date_of_birth || '',
          gender: app.gender || '',
          class: app.class || '',
          contact_number: app.contact_number || '',
          email: app.email || '',
          father_name: app.father_name || '',
          mother_name: app.mother_name || '',
          current_school: app.current_school || '',
          category: app.category || '',
          city: app.city || '',
          state: app.state || '',
          created_at: app.created_at || '',
          student_photo: photoDoc ? getPhotoUrl(photoDoc.file_path) : undefined
        };
      });

      console.log('Processed students data:', studentsWithPhotos.length);
      setStudents(studentsWithPhotos);
      setFilteredStudents(studentsWithPhotos);
      
      toast({
        title: "Success",
        description: `Loaded ${studentsWithPhotos.length} students successfully.`,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      
      let errorMessage = "Failed to fetch students data. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        } else if (error.message.includes('Database connection failed')) {
          errorMessage = "Database connection failed. Please check your Supabase configuration.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set empty arrays to prevent UI issues
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (filePath: string) => {
    try {
      const { data } = supabase.storage
        .from('form-documents')
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.warn('Error getting photo URL:', error);
      return undefined;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'obc': return 'bg-yellow-100 text-yellow-800';
      case 'sc': return 'bg-green-100 text-green-800';
      case 'st': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWhatsAppMessage = (student: Student) => {
    setSelectedStudent(student);
    setShowWhatsAppModal(true);
  };

  const handleCloseWhatsApp = () => {
    setShowWhatsAppModal(false);
    setSelectedStudent(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            Students Database
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, admission number, or class..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="pl-10 text-sm"
              />
            </div>
            <Button onClick={fetchStudents} disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {currentStudents.length} of {filteredStudents.length} students
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No students found</p>
              <p className="text-gray-500 text-sm">
                {students.length === 0 
                  ? "No students have been added yet or there was an error loading data."
                  : "Try adjusting your search criteria"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Student Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {currentStudents.map((student) => (
                  <Card key={student.id} className="overflow-hidden border-2 hover:border-blue-300 transition-colors shadow-md">
                    {/* ID Card Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4">
                      <div className="text-center">
                        <h3 className="font-bold text-xs sm:text-sm">STUDENT ID CARD</h3>
                        <p className="text-xs opacity-90">Admission No: {student.admission_number}</p>
                      </div>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                      {/* Student Photo and Basic Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-blue-200 flex-shrink-0">
                          <AvatarImage 
                            src={student.student_photo} 
                            alt={student.full_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm sm:text-lg font-bold">
                            {getInitials(student.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-lg text-gray-900 line-clamp-2 leading-tight">
                            {student.full_name}
                          </h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <Badge className={`${getCategoryColor(student.category)} text-xs w-fit`}>
                              {student.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs w-fit">
                              Class {student.class}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">DOB: {formatDate(student.date_of_birth)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{student.gender}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{student.contact_number}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{student.city}, {student.state}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{student.current_school}</span>
                        </div>
                      </div>

                      {/* Parent Information */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">Parent Information</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="truncate"><span className="font-medium">Father:</span> {student.father_name}</p>
                          <p className="truncate"><span className="font-medium">Mother:</span> {student.mother_name}</p>
                        </div>
                      </div>

                      {/* WhatsApp Message Button */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <Button
                          onClick={() => handleWhatsAppMessage(student)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          Send WhatsApp
                        </Button>
                      </div>

                      {/* Admission Date */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Admitted: {formatDate(student.created_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0 text-xs"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Messaging Modal */}
      {selectedStudent && (
        <WhatsAppMessaging
          studentName={selectedStudent.full_name}
          amountPaid={0}
          paymentDate={new Date().toISOString().split('T')[0]}
          paymentType="General Communication"
          dueAmount={0}
          phoneNumber={selectedStudent.contact_number}
          isOpen={showWhatsAppModal}
          onClose={handleCloseWhatsApp}
        />
      )}
    </div>
  );
};

export default StudentsSection;