
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="create" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-center">{editingId ? 'Edit Assignment' : 'Create Assignment'}</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-center">Manage Assignments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                {editingId ? 'Edit Homework Assignment' : 'Create New Homework Assignment'}
              </CardTitle>
              <CardDescription className="text-sm">
                {editingId ? 'Update the homework assignment details' : 'Add a new homework assignment for students'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Assignment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter assignment title"
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter subject name"
                      required
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter assignment description (optional)"
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_drive_link" className="text-sm font-medium">Google Drive Link *</Label>
                  <Input
                    id="google_drive_link"
                    value={formData.google_drive_link}
                    onChange={(e) => setFormData({ ...formData, google_drive_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assignment Type *</Label>
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
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Assign to Entire Class</SelectItem>
                      <SelectItem value="individual">Assign to Specific Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.assignment_type === 'class' && (
                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-sm font-medium">Select Class *</Label>
                    <Select
                      value={formData.assigned_to_class}
                      onValueChange={(value) => setFormData({ ...formData, assigned_to_class: value })}
                    >
                      <SelectTrigger className="text-sm">
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
                    <div className="space-y-2">
                      <Label htmlFor="class" className="text-sm font-medium">Select Class First *</Label>
                      <Select
                        value={formData.assigned_to_class}
                        onValueChange={(value) => setFormData({ ...formData, assigned_to_class: value, assigned_to_students: [] })}
                      >
                        <SelectTrigger className="text-sm">
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
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Select Students *</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                          {filteredStudents.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={student.id}
                                checked={Array.isArray(formData.assigned_to_students) && formData.assigned_to_students.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData({
                                      ...formData,
                                      assigned_to_students: [...(Array.isArray(formData.assigned_to_students) ? formData.assigned_to_students : []), student.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      assigned_to_students: (Array.isArray(formData.assigned_to_students) ? formData.assigned_to_students : []).filter(id => id !== student.id)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={student.id} className="text-sm flex-1 cursor-pointer text-gray-900 dark:text-gray-100">
                                {student.full_name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 sm:h-11">
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
                      className="flex-1 sm:flex-initial h-10 sm:h-11"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Manage Homework Assignments</CardTitle>
              <CardDescription className="text-sm">View, edit, or delete existing homework assignments</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {homework.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No homework assignments found</p>
                    <p className="text-gray-400 text-sm mt-2">Create your first assignment using the form above</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {homework.map((item) => (
                      <Card key={item.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">{item.title}</h3>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Subject:</span> {item.subject}
                              </p>
                              {item.description && (
                                <p className="text-sm text-gray-700 break-words">{item.description}</p>
                              )}
                              <div className="space-y-1 text-xs text-gray-500">
                                <p>
                                  <span className="font-medium">Assigned to:</span>{' '}
                                  {item.assigned_to_class || `Students: ${getStudentNames(item.assigned_to_students || [])}`}
                                </p>
                                <p>
                                  <span className="font-medium">Created:</span>{' '}
                                  {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(item.google_drive_link, '_blank')}
                                className="flex-1 sm:flex-initial"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-0" />
                                <span className="sm:hidden">View</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                                className="flex-1 sm:flex-initial"
                              >
                                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-0" />
                                <span className="sm:hidden">Edit</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                                className="flex-1 sm:flex-initial"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-0" />
                                <span className="sm:hidden">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
