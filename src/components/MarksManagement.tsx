import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, GraduationCap, Calendar, User, MessageCircle, Users, UserCheck } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
}

interface ClassInfo {
  class: string;
  student_count: number;
}

interface StudentMark {
  id: string;
  student_id: string;
  subject: string;
  total_marks: number;
  marks_obtained: number;
  test_name: string;
  test_date: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_class?: string;
  contact_number?: string;
}

interface MarksFormData {
  subject: string;
  total_marks: string;
  marks_obtained: string;
  test_name: string;
  test_date: string;
  assignment_type: 'class' | 'student';
  assigned_to_class: string;
  assigned_to_students: string[];
}

const MarksManagement = () => {
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMark, setEditingMark] = useState<StudentMark | null>(null);
  const [selectedMarks, setSelectedMarks] = useState<StudentMark[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState<MarksFormData>({
    subject: '',
    total_marks: '',
    marks_obtained: '',
    test_name: '',
    test_date: new Date().toISOString().split('T')[0],
    assignment_type: 'class',
    assigned_to_class: '',
    assigned_to_students: []
  });

  useEffect(() => {
    fetchMarks();
    fetchStudentsAndClasses();
  }, []);

  const fetchMarks = async () => {
    try {
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          *,
          applications (
            full_name,
            class,
            contact_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const marksWithStudentInfo = data.map(mark => ({
        ...mark,
        student_name: mark.applications?.full_name,
        student_class: mark.applications?.class,
        contact_number: mark.applications?.contact_number
      }));

      setMarks(marksWithStudentInfo || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch marks data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndClasses = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('applications')
        .select('id, full_name, class, contact_number')
        .order('class', { ascending: true })
        .order('full_name', { ascending: true });

      if (studentsError) throw studentsError;

      const students: Student[] = studentsData || [];
      setStudents(students);

      // Group students by class to get class information
      const classGroups = students.reduce((acc, student) => {
        if (!acc[student.class]) {
          acc[student.class] = 0;
        }
        acc[student.class]++;
        return acc;
      }, {} as Record<string, number>);

      const classInfo: ClassInfo[] = Object.entries(classGroups).map(([className, count]) => ({
        class: className,
        student_count: count
      })).sort((a, b) => a.class.localeCompare(b.class));

      setClasses(classInfo);
    } catch (error) {
      console.error('Error fetching students and classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students and classes.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      total_marks: '',
      marks_obtained: '',
      test_name: '',
      test_date: new Date().toISOString().split('T')[0],
      assignment_type: 'class',
      assigned_to_class: '',
      assigned_to_students: []
    });
    setEditingMark(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.total_marks || !formData.marks_obtained || !formData.test_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const totalMarks = Number(formData.total_marks);
    const marksObtained = Number(formData.marks_obtained);

    if (marksObtained > totalMarks) {
      toast({
        title: "Validation Error",
        description: "Marks obtained cannot be greater than total marks.",
        variant: "destructive",
      });
      return;
    }

    if (formData.assignment_type === 'class' && !formData.assigned_to_class.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a class.",
        variant: "destructive",
      });
      return;
    }

    if (formData.assignment_type === 'student' && formData.assigned_to_students.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student.",
        variant: "destructive",
      });
      return;
    }

    try {
      let studentsToUpdate: string[] = [];

      if (formData.assignment_type === 'class') {
        const classStudents = students.filter(s => s.class === formData.assigned_to_class);
        studentsToUpdate = classStudents.map(s => s.id);
      } else {
        studentsToUpdate = formData.assigned_to_students;
      }

      const marksData = studentsToUpdate.map(studentId => ({
        student_id: studentId,
        subject: formData.subject,
        total_marks: totalMarks,
        marks_obtained: marksObtained,
        test_name: formData.test_name,
        test_date: formData.test_date
      }));

      if (editingMark) {
        const { error } = await supabase
          .from('student_marks')
          .update({
            subject: formData.subject,
            total_marks: totalMarks,
            marks_obtained: marksObtained,
            test_name: formData.test_name,
            test_date: formData.test_date
          })
          .eq('id', editingMark.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Marks updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('student_marks')
          .insert(marksData);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Marks added for ${studentsToUpdate.length} student(s) successfully.`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMarks();
    } catch (error) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error",
        description: "Failed to save marks.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (mark: StudentMark) => {
    setEditingMark(mark);
    setFormData({
      subject: mark.subject,
      total_marks: mark.total_marks.toString(),
      marks_obtained: mark.marks_obtained.toString(),
      test_name: mark.test_name,
      test_date: mark.test_date,
      assignment_type: 'student',
      assigned_to_class: '',
      assigned_to_students: [mark.student_id]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark entry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('student_marks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mark entry deleted successfully.",
      });

      fetchMarks();
    } catch (error) {
      console.error('Error deleting mark:', error);
      toast({
        title: "Error",
        description: "Failed to delete mark entry.",
        variant: "destructive",
      });
    }
  };

  const getStudentsByClass = (className: string) => {
    return students.filter(student => student.class === className);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateWhatsAppMessage = (studentMarks: StudentMark[]) => {
    if (studentMarks.length === 0) return '';

    const student = studentMarks[0];
    const testName = student.test_name;
    const testDate = formatDate(student.test_date);
    
    let message = `ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಮಗು ${student.student_name} ಯವರು ${testName} ಪರೀಕ್ಷೆಯಲ್ಲಿ ಈ ಕೆಳಗಿನಂತೆ ಅಂಕಗಳನ್ನು ಪಡೆದಿದ್ದಾರೆ (ಪರೀಕ್ಷೆ ದಿನಾಂಕ: ${testDate}):\n\n`;

    studentMarks.forEach(mark => {
      message += `ವಿಷಯ: ${mark.subject} – ${mark.marks_obtained}/${mark.total_marks}\n`;
    });

    message += `\nಧನ್ಯವಾದಗಳು,\nVISIONA EDUCATION ACADEMY`;

    return message;
  };

  const sendWhatsAppMessage = (studentMarks: StudentMark[]) => {
    if (studentMarks.length === 0) return;

    const student = studentMarks[0];
    const message = generateWhatsAppMessage(studentMarks);
    const phoneNumber = student.contact_number?.replace(/[^0-9]/g, '');
    
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Student's phone number not found.",
        variant: "destructive",
      });
      return;
    }

    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const groupMarksByStudent = () => {
    const grouped = marks.reduce((acc, mark) => {
      if (!acc[mark.student_id]) {
        acc[mark.student_id] = [];
      }
      acc[mark.student_id].push(mark);
      return acc;
    }, {} as Record<string, StudentMark[]>);

    return Object.values(grouped);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marks management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Marks Management</h1>
          <p className="text-gray-600">Add and manage student marks for tests and exams</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Marks
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMark ? 'Edit Marks' : 'Add New Marks'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Enter subject name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    value={formData.test_name}
                    onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                    placeholder="Enter test name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="total_marks">Total Marks *</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    min="1"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({...formData, total_marks: e.target.value})}
                    placeholder="100"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="marks_obtained">Marks Obtained *</Label>
                  <Input
                    id="marks_obtained"
                    type="number"
                    min="0"
                    max={formData.total_marks || undefined}
                    value={formData.marks_obtained}
                    onChange={(e) => setFormData({...formData, marks_obtained: e.target.value})}
                    placeholder="85"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="test_date">Test Date *</Label>
                  <Input
                    id="test_date"
                    type="date"
                    value={formData.test_date}
                    onChange={(e) => setFormData({...formData, test_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              {!editingMark && (
                <>
                  <div>
                    <Label>Assignment Type *</Label>
                    <RadioGroup
                      value={formData.assignment_type}
                      onValueChange={(value: 'class' | 'student') => {
                        setFormData({
                          ...formData, 
                          assignment_type: value,
                          assigned_to_class: '',
                          assigned_to_students: []
                        });
                      }}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="class" id="class" />
                        <Label htmlFor="class" className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Assign to Class
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="flex items-center">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Assign to Specific Students
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.assignment_type === 'class' && (
                    <div>
                      <Label htmlFor="class">Select Class *</Label>
                      <Select
                        value={formData.assigned_to_class}
                        onValueChange={(value) => setFormData({...formData, assigned_to_class: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classInfo) => (
                            <SelectItem key={classInfo.class} value={classInfo.class}>
                              {classInfo.class} ({classInfo.student_count} students)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.assignment_type === 'student' && (
                    <div>
                      <Label>Select Students *</Label>
                      <div className="mt-2 space-y-2">
                        <div className="text-sm text-gray-600 mb-2">
                          Selected: {formData.assigned_to_students.length} students
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                          {classes.map((classInfo) => (
                            <div key={classInfo.class}>
                              <div className="font-medium text-sm text-gray-700 mb-2">
                                {classInfo.class} ({classInfo.student_count} students)
                              </div>
                              <div className="ml-4 space-y-1">
                                {getStudentsByClass(classInfo.class).map((student) => (
                                  <div key={student.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={student.id}
                                      checked={formData.assigned_to_students.includes(student.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setFormData({
                                            ...formData,
                                            assigned_to_students: [...formData.assigned_to_students, student.id]
                                          });
                                        } else {
                                          setFormData({
                                            ...formData,
                                            assigned_to_students: formData.assigned_to_students.filter(id => id !== student.id)
                                          });
                                        }
                                      }}
                                    />
                                    <Label htmlFor={student.id} className="text-sm">
                                      {student.full_name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMark ? 'Update' : 'Add'} Marks
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Marks ({marks.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {marks.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No marks recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell className="font-medium">{mark.student_name}</TableCell>
                      <TableCell>{mark.student_class}</TableCell>
                      <TableCell>{mark.subject}</TableCell>
                      <TableCell>{mark.test_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {mark.marks_obtained}/{mark.total_marks}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(mark.test_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(mark)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(mark.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const studentMarks = marks.filter(m => 
                                m.student_id === mark.student_id && 
                                m.test_name === mark.test_name &&
                                m.test_date === mark.test_date
                              );
                              sendWhatsAppMessage(studentMarks);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Bulk Send Section */}
      {marks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              Send Marks via WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Send marks to parents grouped by student and test. Each student will receive their marks for all subjects in a single message.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupMarksByStudent().map((studentMarks) => {
                  const student = studentMarks[0];
                  const testGroups = studentMarks.reduce((acc, mark) => {
                    const key = `${mark.test_name}-${mark.test_date}`;
                    if (!acc[key]) {
                      acc[key] = [];
                    }
                    acc[key].push(mark);
                    return acc;
                  }, {} as Record<string, StudentMark[]>);

                  return (
                    <Card key={student.student_id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h4 className="font-medium">{student.student_name}</h4>
                          <p className="text-sm text-gray-600">Class: {student.student_class}</p>
                          <p className="text-sm text-gray-600">Phone: {student.contact_number}</p>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(testGroups).map(([testKey, testMarks]) => (
                            <div key={testKey} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{testMarks[0].test_name}</p>
                                <p className="text-xs text-gray-500">{formatDate(testMarks[0].test_date)}</p>
                                <p className="text-xs text-gray-500">{testMarks.length} subjects</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => sendWhatsAppMessage(testMarks)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarksManagement;