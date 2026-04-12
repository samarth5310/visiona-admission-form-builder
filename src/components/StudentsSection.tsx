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
  const [itemsPerPage] = useState(8); // Reduced for better mobile experience
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = students.filter(student =>
      (student.full_name || '').toLowerCase().includes(query) ||
      (student.admission_number || '').toLowerCase().includes(query) ||
      (student.class || '').toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);


      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('applications')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }



      // Fetch applications first
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw new Error(`Failed to fetch applications: ${applicationsError.message}`);
      }



      // Fetch documents separately to avoid join issues
      const { data: documents, error: documentsError } = await supabase
        .from('application_documents')
        .select('application_id, document_type, file_path, file_name')
        .eq('document_type', 'student_photo');

      if (documentsError) {
        console.warn('Error fetching documents (non-critical):', documentsError);
      }



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
    <div className="w-full overflow-x-hidden">
      <Card className="w-full shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white p-3 sm:p-6">
          <CardTitle className="text-base sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Users className="h-4 w-4 sm:h-6 sm:w-6" />
            Students Database
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="pl-10 text-sm dark:text-gray-200 h-9"
              />
            </div>
            <Button onClick={fetchStudents} disabled={loading} size="sm" className="sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-700">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Results Count */}
          <div className="mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {filteredStudents.length} students
            {totalPages > 1 && (
              <span className="ml-1">
                • Page {currentPage}/{totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-base">No students found</p>
              <p className="text-gray-500 text-xs mt-1">
                {students.length === 0
                  ? "No students have been added yet."
                  : "Try adjusting your search"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Mobile List View - Compact */}
              <div className="block sm:hidden space-y-2">
                {currentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Avatar className="h-10 w-10 border border-emerald-200 dark:border-emerald-700 flex-shrink-0">
                      <AvatarImage
                        src={student.student_photo}
                        alt={student.full_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {getInitials(student.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {student.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="font-mono">{student.admission_number}</span>
                        <span>•</span>
                        <span>Class {student.class}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <Phone className="h-2.5 w-2.5" />
                        <span>{student.contact_number}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleWhatsAppMessage(student)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0 flex-shrink-0"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop/Tablet Grid View */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {currentStudents.map((student) => (
                  <Card key={student.id} className="overflow-hidden border hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    {/* ID Card Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-xs">ID CARD</h3>
                        <p className="text-[10px] opacity-90 font-mono">{student.admission_number}</p>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      {/* Student Photo and Basic Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12 border border-emerald-200 flex-shrink-0">
                          <AvatarImage
                            src={student.student_photo}
                            alt={student.full_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs font-bold">
                            {getInitials(student.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate" title={student.full_name}>
                            {student.full_name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            <Badge className={`${getCategoryColor(student.category)} text-[10px] px-1.5 py-0 h-4`}>
                              {student.category}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              Cl: {student.class}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Student Details - Compact Grid */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{formatDate(student.date_of_birth)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 flex-shrink-0 text-gray-400" />
                          <span>{student.gender}</span>
                        </div>

                        <div className="flex items-center gap-1.5 col-span-2">
                          <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{student.contact_number}</span>
                        </div>

                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400" />
                          <span className="truncate" title={`${student.city}, ${student.state}`}>
                            {student.city}, {student.state}
                          </span>
                        </div>
                      </div>

                      {/* Parent Information - Compact */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mb-3">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 flex justify-between">
                          <span className="truncate max-w-[48%]"><span className="font-medium">F:</span> {student.father_name}</span>
                          <span className="truncate max-w-[48%]"><span className="font-medium">M:</span> {student.mother_name}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        onClick={() => handleWhatsAppMessage(student)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1.5 text-[10px] h-7"
                      >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Prev</span>
                  </Button>

                  {/* Page Numbers - Fewer on mobile */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage <= 2) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 2 + i;
                      } else {
                        pageNum = currentPage - 1 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 p-0 text-xs ${currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700' : ''}`}
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
                    className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
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