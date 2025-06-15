
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Phone, Mail, MapPin, Calendar, GraduationCap, User, MessageCircle } from 'lucide-react';
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
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students data...');
      
      // Fetch applications with their documents
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          application_documents (
            document_type,
            file_path,
            file_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const studentsWithPhotos: Student[] = applications.map(app => {
        // Find student photo from documents
        const documents = Array.isArray(app.application_documents) ? app.application_documents : [];
        const photoDoc = documents.find(doc => doc.document_type === 'student_photo');
        
        return {
          id: app.id,
          admission_number: app.admission_number,
          full_name: app.full_name,
          date_of_birth: app.date_of_birth,
          gender: app.gender,
          class: app.class,
          contact_number: app.contact_number,
          email: app.email,
          father_name: app.father_name,
          mother_name: app.mother_name,
          current_school: app.current_school,
          category: app.category,
          city: app.city,
          state: app.state,
          created_at: app.created_at,
          student_photo: photoDoc ? getPhotoUrl(photoDoc.file_path) : undefined
        };
      });

      console.log('Processed students data:', studentsWithPhotos);
      setStudents(studentsWithPhotos);
      setFilteredStudents(studentsWithPhotos);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('form-documents')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Students Database
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, admission number, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchStudents} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
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
                <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="overflow-hidden border-2 hover:border-blue-300 transition-colors shadow-md">
                    {/* ID Card Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                      <div className="text-center">
                        <h3 className="font-bold text-sm">STUDENT ID CARD</h3>
                        <p className="text-xs opacity-90">Admission No: {student.admission_number}</p>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      {/* Student Photo and Basic Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-20 w-20 border-2 border-blue-200">
                          <AvatarImage 
                            src={student.student_photo} 
                            alt={student.full_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">
                            {getInitials(student.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {student.full_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(student.category)}>
                              {student.category}
                            </Badge>
                            <Badge variant="outline">
                              Class {student.class}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>DOB: {formatDate(student.date_of_birth)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{student.gender}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{student.contact_number}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{student.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{student.city}, {student.state}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap className="h-4 w-4" />
                          <span className="truncate">{student.current_school}</span>
                        </div>
                      </div>

                      {/* Parent Information */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Parent Information</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Father:</span> {student.father_name}</p>
                          <p><span className="font-medium">Mother:</span> {student.mother_name}</p>
                        </div>
                      </div>

                      {/* WhatsApp Message Button */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <Button
                          onClick={() => handleWhatsAppMessage(student)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Send WhatsApp Message
                        </Button>
                      </div>

                      {/* Admission Date */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Admitted on: {formatDate(student.created_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
