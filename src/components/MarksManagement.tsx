
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageCircle, Save, X } from 'lucide-react';
import type { MarkFormData, StudentMark } from '@/types/marks';

interface Student {
  id: string;
  full_name: string;
  contact_number: string;
  class: string;
}

const MarksManagement = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'all'>('individual');
  const [formData, setFormData] = useState<Omit<MarkFormData, 'student_id'>>({
    subject: '',
    total_marks: 0,
    marks_obtained: 0,
    test_name: '',
    test_date: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name, contact_number, class')
        .order('full_name');
      
      if (error) throw error;
      return data as Student[];
    }
  });

  // Fetch marks
  const { data: marks = [], isLoading } = useQuery({
    queryKey: ['marks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          *,
          applications (
            full_name,
            contact_number,
            class
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (StudentMark & { applications: { full_name: string; contact_number: string; class: string } })[];
    }
  });

  // Create marks mutation
  const createMarks = useMutation({
    mutationFn: async (marksData: MarkFormData[]) => {
      const { error } = await supabase
        .from('student_marks')
        .insert(marksData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      resetForm();
      toast({
        title: "Success",
        description: "Marks uploaded successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload marks. Please try again.",
        variant: "destructive"
      });
      console.error('Error uploading marks:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      total_marks: 0,
      marks_obtained: 0,
      test_name: '',
      test_date: new Date().toISOString().split('T')[0]
    });
    setSelectedStudents([]);
    setIsCreating(false);
    setAssignmentType('individual');
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.test_name || formData.total_marks <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const targetStudents = assignmentType === 'all' ? students.map(s => s.id) : selectedStudents;
    
    if (targetStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student.",
        variant: "destructive"
      });
      return;
    }

    const marksData: MarkFormData[] = targetStudents.map(studentId => ({
      ...formData,
      student_id: studentId
    }));

    createMarks.mutate(marksData);
  };

  const generateWhatsAppMessage = (studentMarks: StudentMark[], student: { full_name: string; contact_number: string }) => {
    const groupedMarks = studentMarks.reduce((acc, mark) => {
      const key = `${mark.test_name}_${mark.test_date}`;
      if (!acc[key]) {
        acc[key] = {
          test_name: mark.test_name,
          test_date: mark.test_date,
          subjects: []
        };
      }
      acc[key].subjects.push({
        subject: mark.subject,
        marks_obtained: mark.marks_obtained,
        total_marks: mark.total_marks
      });
      return acc;
    }, {} as Record<string, any>);

    let message = `ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಮಗು ${student.full_name} ಯವರು `;
    
    Object.values(groupedMarks).forEach((test: any) => {
      message += `${test.test_name} ಪರೀಕ್ಷೆಯಲ್ಲಿ ಈ ಕೆಳಗಿನಂತೆ ಅಂಕಗಳನ್ನು ಪಡೆದಿದ್ದಾರೆ (ಪರೀಕ್ಷೆ ದಿನಾಂಕ: ${new Date(test.test_date).toLocaleDateString('en-GB')}):\n\n`;
      
      test.subjects.forEach((subject: any) => {
        message += `ವಿಷಯ: ${subject.subject} – ${subject.marks_obtained}/${subject.total_marks}\n`;
      });
      
      message += '\n';
    });
    
    message += 'ಧನ್ಯವಾದಗಳು,\nVISIONA EDUCATION ACADEMY';
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppShare = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const studentMarks = marks.filter(m => m.student_id === studentId);
    
    if (!student || studentMarks.length === 0) {
      toast({
        title: "Error",
        description: "No marks found for this student.",
        variant: "destructive"
      });
      return;
    }

    const message = generateWhatsAppMessage(studentMarks, student);
    const whatsappUrl = `https://wa.me/${student.contact_number}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Create Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upload Student Marks
              <Button variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    value={formData.test_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, test_name: e.target.value }))}
                    placeholder="Enter test name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="test_date">Test Date *</Label>
                  <Input
                    id="test_date"
                    type="date"
                    value={formData.test_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, test_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_marks">Total Marks *</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    min="1"
                    value={formData.total_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_marks: parseInt(e.target.value) || 0 }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, marks_obtained: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Assignment Type</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="individual"
                      checked={assignmentType === 'individual'}
                      onChange={(e) => setAssignmentType(e.target.value as 'individual' | 'all')}
                    />
                    <span>Select Individual Students</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="all"
                      checked={assignmentType === 'all'}
                      onChange={(e) => setAssignmentType(e.target.value as 'individual' | 'all')}
                    />
                    <span>All Students</span>
                  </label>
                </div>
              </div>

              {assignmentType === 'individual' && (
                <div>
                  <Label>Select Students</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                        />
                        <Label htmlFor={student.id} className="text-sm">
                          {student.full_name} ({student.class})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMarks.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Upload Marks
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Marks Management</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Marks
          </Button>
        )}
      </div>

      {/* Marks List */}
      <div className="grid gap-4">
        {marks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No marks uploaded yet.</p>
            </CardContent>
          </Card>
        ) : (
          marks.map((mark) => (
            <Card key={mark.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mark.applications.full_name}</h3>
                    <p className="text-gray-600">Class: {mark.applications.class}</p>
                    <div className="mt-2 space-y-1">
                      <p><strong>Test:</strong> {mark.test_name}</p>
                      <p><strong>Subject:</strong> {mark.subject}</p>
                      <p><strong>Marks:</strong> {mark.marks_obtained}/{mark.total_marks}</p>
                      <p><strong>Date:</strong> {new Date(mark.test_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleWhatsAppShare(mark.student_id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MarksManagement;
