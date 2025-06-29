
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, GraduationCap, Edit2, Trash2, MessageCircle } from 'lucide-react';
import type { StudentMark, MarkFormData } from '@/types/marks';

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
}

const MarksManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<(StudentMark & { student_name: string; contact_number: string })[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [formData, setFormData] = useState<MarkFormData>({
    student_id: '',
    subject: '',
    total_marks: 0,
    marks_obtained: 0,
    test_name: '',
    test_date: ''
  });
  const [entryType, setEntryType] = useState<'individual' | 'bulk'>('individual');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentsAndClasses();
    fetchMarks();
  }, []);

  const fetchStudentsAndClasses = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('applications')
        .select('id, full_name, class, contact_number')
        .order('full_name');

      if (error) throw error;

      setStudents(studentsData || []);
      
      const uniqueClasses = [...new Set(studentsData?.map(s => s.class) || [])];
      setClasses(uniqueClasses.sort());
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchMarks = async () => {
    try {
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          *,
          applications(full_name, contact_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const marksWithNames = data?.map(mark => ({
        ...mark,
        student_name: mark.applications?.full_name || 'Unknown',
        contact_number: mark.applications?.contact_number || ''
      })) || [];

      setMarks(marksWithNames);
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch marks",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.subject.trim() || !formData.test_name.trim() || !formData.test_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.marks_obtained > formData.total_marks) {
      toast({
        title: "Validation Error",
        description: "Marks obtained cannot be greater than total marks",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const markData = {
        student_id: formData.student_id,
        subject: formData.subject.trim(),
        total_marks: formData.total_marks,
        marks_obtained: formData.marks_obtained,
        test_name: formData.test_name.trim(),
        test_date: formData.test_date
      };

      if (editingId) {
        const { error } = await supabase
          .from('student_marks')
          .update(markData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Marks updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('student_marks')
          .insert([markData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Marks added successfully!",
        });
      }

      setFormData({
        student_id: '',
        subject: '',
        total_marks: 0,
        marks_obtained: 0,
        test_name: '',
        test_date: ''
      });
      setEditingId(null);
      fetchMarks();
    } catch (error) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error",
        description: "Failed to save marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !formData.subject.trim() || !formData.test_name.trim() || !formData.test_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.marks_obtained > formData.total_marks) {
      toast({
        title: "Validation Error",
        description: "Marks obtained cannot be greater than total marks",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const classStudents = students.filter(s => s.class === selectedClass);
      
      const bulkMarks = classStudents.map(student => ({
        student_id: student.id,
        subject: formData.subject.trim(),
        total_marks: formData.total_marks,
        marks_obtained: formData.marks_obtained,
        test_name: formData.test_name.trim(),
        test_date: formData.test_date
      }));

      const { error } = await supabase
        .from('student_marks')
        .insert(bulkMarks);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Marks added for ${classStudents.length} students!`,
      });

      setFormData({
        student_id: '',
        subject: '',
        total_marks: 0,
        marks_obtained: 0,
        test_name: '',
        test_date: ''
      });
      setSelectedClass('');
      fetchMarks();
    } catch (error) {
      console.error('Error saving bulk marks:', error);
      toast({
        title: "Error",
        description: "Failed to save bulk marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (mark: StudentMark & { student_name: string }) => {
    setFormData({
      student_id: mark.student_id,
      subject: mark.subject,
      total_marks: mark.total_marks,
      marks_obtained: mark.marks_obtained,
      test_name: mark.test_name,
      test_date: mark.test_date
    });
    setEditingId(mark.id);
    setEntryType('individual');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark entry?')) return;

    try {
      const { error } = await supabase
        .from('student_marks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mark entry deleted successfully!",
      });
      fetchMarks();
    } catch (error) {
      console.error('Error deleting mark:', error);
      toast({
        title: "Error",
        description: "Failed to delete mark entry",
        variant: "destructive",
      });
    }
  };

  const sendWhatsAppMessage = (mark: StudentMark & { student_name: string; contact_number: string }) => {
    const message = `ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಮಗು ${mark.student_name} ಯವರು ${mark.test_name} ಪರೀಕ್ಷೆಯಲ್ಲಿ ಈ ಕೆಳಗಿನಂತೆ ಅಂಕಗಳನ್ನು ಪಡೆದಿದ್ದಾರೆ (ಪರೀಕ್ಷೆ ದಿನಾಂಕ: ${new Date(mark.test_date).toLocaleDateString()}):

ವಿಷಯ: ${mark.subject} – ${mark.marks_obtained}/${mark.total_marks}

ಧನ್ಯವಾದಗಳು,
VISIONA EDUCATION ACADEMY`;

    const whatsappUrl = `https://wa.me/${mark.contact_number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getFilteredStudents = () => {
    return entryType === 'individual' ? students : students.filter(s => s.class === selectedClass);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Marks
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Manage Marks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Marks' : 'Add Student Marks'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update the mark entry' : 'Add marks for individual students or entire class'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!editingId && (
                  <div>
                    <Label>Entry Type</Label>
                    <Select
                      value={entryType}
                      onValueChange={(value: 'individual' | 'bulk') => {
                        setEntryType(value);
                        setFormData({
                          student_id: '',
                          subject: '',
                          total_marks: 0,
                          marks_obtained: 0,
                          test_name: '',
                          test_date: ''
                        });
                        setSelectedClass('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Student</SelectItem>
                        <SelectItem value="bulk">Entire Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <form onSubmit={entryType === 'bulk' ? handleBulkSubmit : handleSubmit} className="space-y-6">
                  {entryType === 'bulk' && !editingId && (
                    <div>
                      <Label htmlFor="class">Select Class *</Label>
                      <Select
                        value={selectedClass}
                        onValueChange={setSelectedClass}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {entryType === 'individual' && (
                    <div>
                      <Label htmlFor="student">Select Student *</Label>
                      <Select
                        value={formData.student_id}
                        onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name} - {student.class}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Enter subject name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="test_name">Test Name *</Label>
                      <Input
                        id="test_name"
                        value={formData.test_name}
                        onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                        placeholder="Enter test name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="total_marks">Total Marks *</Label>
                      <Input
                        id="total_marks"
                        type="number"
                        min="0"
                        value={formData.total_marks}
                        onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="marks_obtained">Marks Obtained *</Label>
                      <Input
                        id="marks_obtained"
                        type="number"
                        min="0"
                        max={formData.total_marks}
                        value={formData.marks_obtained}
                        onChange={(e) => setFormData({ ...formData, marks_obtained: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="test_date">Test Date *</Label>
                      <Input
                        id="test_date"
                        type="date"
                        value={formData.test_date}
                        onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (editingId ? 'Updating...' : (entryType === 'bulk' ? 'Adding for Class...' : 'Adding...')) : 
                       (editingId ? 'Update Marks' : (entryType === 'bulk' ? 'Add for Entire Class' : 'Add Marks'))}
                    </Button>
                    {editingId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingId(null);
                          setFormData({
                            student_id: '',
                            subject: '',
                            total_marks: 0,
                            marks_obtained: 0,
                            test_name: '',
                            test_date: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Student Marks</CardTitle>
              <CardDescription>View, edit, delete marks and send WhatsApp messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No marks found</p>
                ) : (
                  marks.map((mark) => (
                    <div key={mark.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{mark.student_name}</h3>
                          <p className="text-sm text-gray-600">{mark.test_name} - {mark.subject}</p>
                          <p className="text-sm text-gray-700">
                            Marks: {mark.marks_obtained}/{mark.total_marks} 
                            ({((mark.marks_obtained / mark.total_marks) * 100).toFixed(1)}%)
                          </p>
                          <p className="text-xs text-gray-500">
                            Test Date: {new Date(mark.test_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendWhatsAppMessage(mark)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(mark)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(mark.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarksManagement;
