
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Eye, Edit2, Trash2 } from 'lucide-react';

interface HomeworkFormData {
  title: string;
  subject: string;
  description: string;
  google_drive_link: string;
  assigned_to_class: string;
  assigned_to_students: string[];
  assignment_type: 'class' | 'individual';
}

interface Student {
  id: string;
  full_name: string;
  class: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  google_drive_link: string;
  assigned_to_class: string;
  assigned_to_students: string[];
  assigned_by: string;
  created_at: string;
}

const AdminHomework = () => {
  const [formData, setFormData] = useState<HomeworkFormData>({
    title: '',
    subject: '',
    description: '',
    google_drive_link: '',
    assigned_to_class: '',
    assigned_to_students: [],
    assignment_type: 'class'
  });

  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHomework();
    fetchStudentsAndClasses();
  }, []);

  useEffect(() => {
    if (formData.assignment_type === 'individual' && formData.assigned_to_class) {
      const filtered = students.filter(student => student.class === formData.assigned_to_class);
      setFilteredStudents(filtered);
    }
  }, [formData.assigned_to_class, formData.assignment_type, students]);

  const fetchStudentsAndClasses = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('applications')
        .select('id, full_name, class')
        .order('full_name');

      if (error) throw error;

      setStudents(studentsData || []);
      
      // Extract unique classes
      const uniqueClasses = [...new Set(studentsData?.map(s => s.class) || [])];
      setClasses(uniqueClasses.sort());
    } catch (error) {
      console.error('Error fetching students and classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students and classes",
        variant: "destructive",
      });
    }
  };

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast({
        title: "Error",
        description: "Failed to fetch homework assignments",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.subject.trim() || !formData.google_drive_link.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.assignment_type === 'class' && !formData.assigned_to_class) {
      toast({
        title: "Validation Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    if (formData.assignment_type === 'individual' && formData.assigned_to_students.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const homeworkData = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        google_drive_link: formData.google_drive_link.trim(),
        assigned_to_class: formData.assignment_type === 'class' ? formData.assigned_to_class : '',
        assigned_to_students: formData.assignment_type === 'individual' ? formData.assigned_to_students : null,
        assigned_by: 'Admin'
      };

      if (editingId) {
        const { error } = await supabase
          .from('homework')
          .update(homeworkData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homework assignment updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('homework')
          .insert([homeworkData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homework assignment created successfully!",
        });
      }

      // Reset form
      setFormData({
        title: '',
        subject: '',
        description: '',
        google_drive_link: '',
        assigned_to_class: '',
        assigned_to_students: [],
        assignment_type: 'class'
      });
      setEditingId(null);
      fetchHomework();
    } catch (error) {
      console.error('Error saving homework:', error);
      toast({
        title: "Error",
        description: "Failed to save homework assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (homework: HomeworkItem) => {
    setFormData({
      title: homework.title,
      subject: homework.subject,
      description: homework.description || '',
      google_drive_link: homework.google_drive_link,
      assigned_to_class: homework.assigned_to_class,
      assigned_to_students: homework.assigned_to_students || [],
      assignment_type: homework.assigned_to_students && homework.assigned_to_students.length > 0 ? 'individual' : 'class'
    });
    setEditingId(homework.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework assignment?')) return;

    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework assignment deleted successfully!",
      });
      fetchHomework();
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast({
        title: "Error",
        description: "Failed to delete homework assignment",
        variant: "destructive",
      });
    }
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds.map(id => {
      const student = students.find(s => s.id === id);
      return student ? student.full_name : 'Unknown';
    }).join(', ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingId ? 'Edit Assignment' : 'Create Assignment'}
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Manage Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Homework Assignment' : 'Create New Homework Assignment'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update the homework assignment details' : 'Add a new homework assignment for students'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

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
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter assignment description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="google_drive_link">Google Drive Link *</Label>
                  <Input
                    id="google_drive_link"
                    value={formData.google_drive_link}
                    onChange={(e) => setFormData({ ...formData, google_drive_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                  />
                </div>

                <div>
                  <Label>Assignment Type *</Label>
                  <Select
                    value={formData.assignment_type}
                    onValueChange={(value: 'class' | 'individual') => {
                      setFormData({ 
                        ...formData, 
                        assignment_type: value, 
                        assigned_to_class: '',
                        assigned_to_students: []
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Assign to Entire Class</SelectItem>
                      <SelectItem value="individual">Assign to Specific Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.assignment_type === 'class' && (
                  <div>
                    <Label htmlFor="class">Select Class *</Label>
                    <Select
                      value={formData.assigned_to_class}
                      onValueChange={(value) => setFormData({ ...formData, assigned_to_class: value })}
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

                {formData.assignment_type === 'individual' && (
                  <>
                    <div>
                      <Label htmlFor="class">Select Class First *</Label>
                      <Select
                        value={formData.assigned_to_class}
                        onValueChange={(value) => setFormData({ ...formData, assigned_to_class: value, assigned_to_students: [] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class to filter students" />
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

                    {formData.assigned_to_class && (
                      <div>
                        <Label>Select Students *</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                          {filteredStudents.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={student.id}
                                checked={formData.assigned_to_students.includes(student.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
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
                                className="rounded"
                              />
                              <Label htmlFor={student.id} className="text-sm">
                                {student.full_name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Assignment' : 'Create Assignment')}
                  </Button>
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: '',
                          subject: '',
                          description: '',
                          google_drive_link: '',
                          assigned_to_class: '',
                          assigned_to_students: [],
                          assignment_type: 'class'
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Homework Assignments</CardTitle>
              <CardDescription>View, edit, or delete existing homework assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {homework.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No homework assignments found</p>
                ) : (
                  homework.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-gray-600">Subject: {item.subject}</p>
                          {item.description && (
                            <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Assigned to: {item.assigned_to_class || `Students: ${getStudentNames(item.assigned_to_students || [])}`}</p>
                            <p>Created: {new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(item.google_drive_link, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
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

export default AdminHomework;
